/**
 * Developer: Stepan Burguchev
 * Date: 8/20/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, _, Handlebars, shared, $ */

/*
*
* Fires: columnsResize(this, { changes: { 0: 0.5, 1: 0.5 } })
*
* */

define(['text!core/list/templates/gridheader.html', 'module/lib', 'core/utils/utilsApi', 'core/services/GlobalEventService'],
    function (template, lib, utils, GlobalEventService) {
        'use strict';

        /**
         * Some description for initializer
         * @name GridHeaderView
         * @memberof module:core.list.views
         * @class GridHeaderView
         * @constructor
         * @description View используемый для отображения заголовка (шапки) списка
         * @extends Marionette.ItemView
         * @param {Object} options Constructor options
         * @param {Array} options.columns массив колонок
         * @param {Object} options.gridEventAggregator ?
         * @param {Backbone.View} options.gridColumnHeaderView View используемый для отображения заголовка (шапки) списка
         * */
        var GridHeaderView = Marionette.ItemView.extend({
            initialize: function (options) {
                if (!options.columns) {
                    throw new Error('You must provide columns definition ("columns" option)');
                }
                if (!options.gridEventAggregator) {
                    throw new Error('You must provide grid event aggregator ("gridEventAggregator" option)');
                }
                if (!options.gridColumnHeaderView) {
                    throw new Error('You must provide grid column header view ("gridColumnHeaderView" option)');
                }

                this.gridEventAggregator = options.gridEventAggregator;
                this.gridColumnHeaderView = options.gridColumnHeaderView;
                this.gridColumnHeaderViewOptions = options.gridColumnHeaderViewOptions;
                this.columns = options.columns;
                this.$document = $(document);
                _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResizeInternal', '__handleColumnSort', '__handleResize');
                this.listenTo(GlobalEventService, 'resize', this.__handleResize);
            },

            template: Handlebars.compile(template),

            className: 'grid-header',

            ui: {
                gridHeaderColumn: '.grid-header-column',
                gridHeaderColumnContent: '.grid-header-column-content-view'
            },

            events: {
                'mousedown .grid-header-dragger': '__handleDraggerMousedown'
            },

            constants: {
                MIN_COLUMN_WIDTH: 20
            },

            templateHelpers: function () {
                return {
                    columns: this.columns
                };
            },

            onRender: function () {
                var self = this;
                this.ui.gridHeaderColumnContent.each(function (i, el) {
                    var column = self.columns[i];
                    var view = new self.gridColumnHeaderView(_.extend(self.gridColumnHeaderViewOptions || {}, {
                        model: column.viewModel,
                        column: column
                    }));
                    self.listenTo(view, 'columnSort', self.__handleColumnSort);
                    var childEl = view.render().el;
                    el.appendChild(childEl);
                });
            },

            onShow: function () {
                this.__handleResizeInternal();
            },

            updateSorting: function () {
                this.render();
                this.__handleResizeInternal();
            },

            __handleColumnSort: function (sender, args) {
                var column = args.column;
                var sorting = column.sorting;
                var comparator;
                _.each(this.columns, function (c) {
                    c.sorting = null;
                });
                switch (sorting) {
                    case 'asc':
                        column.sorting = 'desc';
                        comparator = column.sortDesc;
                        break;
                    case 'desc':
                        column.sorting = 'asc';
                        comparator = column.sortAsc;
                        break;
                    default:
                        column.sorting = 'asc';
                        comparator = column.sortAsc;
                        break;
                }
                this.updateSorting();

                this.trigger('onColumnSort', column, comparator);
            },

            __handleDraggerMousedown: function (e) {
                this.__stopDrag();
                this.__startDrag(e);
                return false;
            },

            __getElementOuterWidth: function (el) {
                return $(el)[0].getBoundingClientRect().width;
            },

            __startDrag: function (e) {
                var $dragger = $(e.target);
                var $column = $dragger.parent();

                var affectedColumns = _.chain($column.nextAll()).toArray().map(function (el) {
                    return {
                        $el: $(el),
                        initialWidth: this.__getElementOuterWidth(el)
                    };
                }, this).value();
                var draggedColumn = {
                    $el: $column,
                    initialWidth: this.__getElementOuterWidth($column),
                    index: $column.index()
                };
                var unaffectedWidth = _.reduce($column.prevAll(), function (m, v) {
                    return m + this.__getElementOuterWidth(v);
                }.bind(this), 0);
                var fullWidth = this.__getFullWidth();

                this.dragContext = {
                    pageOffsetX: e.pageX,
                    $dragger: $dragger,
                    fullWidth: fullWidth,
                    unaffectedWidth: unaffectedWidth,
                    draggedColumn: draggedColumn,
                    affectedColumns: affectedColumns,
                    maxColumnWidth: fullWidth - affectedColumns.length * this.constants.MIN_COLUMN_WIDTH - unaffectedWidth
                };

                $dragger.addClass('active');
                this.$document.mousemove(this.__draggerMouseMove).mouseup(this.__draggerMouseUp);
            },

            __stopDrag: function () {
                if (!this.dragContext) {
                    return;
                }

                this.dragContext.$dragger.removeClass('active');
                this.dragContext = null;
                this.$document.unbind('mousemove', this.__draggerMouseMove);
                this.$document.unbind('mouseup', this.__draggerMouseUp);
            },

            __draggerMouseMove: function (e) {
                if (!this.dragContext) {
                    return;
                }

                var ctx = this.dragContext;
                var delta = e.pageX - ctx.pageOffsetX;
                if (delta !== 0) {
                    var draggedColumn = ctx.draggedColumn;
                    var index = ctx.draggedColumn.index;
                    var changes = {};

                    this.columns[index].absWidth = Math.min(ctx.maxColumnWidth, Math.max(this.constants.MIN_COLUMN_WIDTH, draggedColumn.initialWidth + delta));
                    delta = this.columns[index].absWidth - draggedColumn.initialWidth;
                    draggedColumn.$el.outerWidth(this.columns[index].absWidth);

                    var newColumnWidthPc = this.columns[index].absWidth / ctx.fullWidth;
                    this.columns[index].width = newColumnWidthPc;
                    changes[index] = this.columns[index].absWidth;
                        index++;

                    var affectedColumnsWidth = ctx.fullWidth - ctx.unaffectedWidth - draggedColumn.initialWidth,
                        sumDelta = 0,
                        sumGap = 0;

                    for (var i = 0;  i < ctx.affectedColumns.length; i++) {
                        var c = ctx.affectedColumns[i],
                            newColumnWidth = c.initialWidth - delta * c.initialWidth / affectedColumnsWidth;

                        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
                            sumDelta += this.constants.MIN_COLUMN_WIDTH - newColumnWidth;
                            newColumnWidth = this.constants.MIN_COLUMN_WIDTH;
                        } else {
                            sumGap += newColumnWidth - this.constants.MIN_COLUMN_WIDTH;
                        }

                        this.columns[index].absWidth = newColumnWidth;
                        index++;
                    }

                    var fullSum = 0;
                    index = ctx.draggedColumn.index + 1;
                    for (var i = 0; i < ctx.affectedColumns.length; i++) {
                        var c = ctx.affectedColumns[i];
                        if (sumDelta > 0 && this.columns[index].absWidth > this.constants.MIN_COLUMN_WIDTH) {
                            var delta = (this.columns[index].absWidth - this.constants.MIN_COLUMN_WIDTH) * sumDelta / sumGap;
                            this.columns[index].absWidth -= delta;
                        }

                        fullSum += this.columns[index].absWidth;

                        if (i === ctx.affectedColumns.length - 1) {
                            var sumDelta = ctx.fullWidth - ctx.unaffectedWidth - this.columns[ctx.draggedColumn.index].absWidth - fullSum;
                            this.columns[index].absWidth += sumDelta;
                        }

                        var newColumnWidthPc = this.columns[index].absWidth / ctx.fullWidth;
                        this.columns[index].width = newColumnWidthPc;
                        c.$el.outerWidth(this.columns[index].absWidth);
                        changes[index] = this.columns[index].absWidth;
                        index++;
                    }

                    this.gridEventAggregator.trigger('columnsResize');
                }

                return false;
            },

            __draggerMouseUp: function () {
                this.__stopDrag();
                return false;
            },

            __handleResize: function () {
                this.__handleResizeInternal();
                this.gridEventAggregator.trigger('columnsResize');
            },

            __getFullWidth: function () {
                return this.$el.parent().width() - 1; //Magic cross browser pixel, don't remove it
            },

            __handleResizeInternal: function () {
                var fullWidth = this.__getFullWidth(),
                    columnWidth = fullWidth / this.columns.length;

                this.ui.gridHeaderColumn.each(function (i, el) {
                    var child = $(el);
                    var col = this.columns[i];
                    if (col.width) {
                        col.absWidth = col.width * fullWidth;
                        child.outerWidth(col.absWidth);
                    } else {
                        col.absWidth = columnWidth;
                        child.outerWidth(col.absWidth);
                    }
                }.bind(this));
            }
        });

        return GridHeaderView;
    });
