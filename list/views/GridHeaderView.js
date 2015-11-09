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

define(['text!core/list/templates/gridheader.html', 'module/lib', 'core/utils/utilsApi'],
    function (template, lib, utils) {
        'use strict';
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
                _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResize', '__handleResizeInternal', '__handleColumnSort');
                $(window).resize(this.__handleResize);
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

            onDestroy: function () {
                $(window).off('resize');
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

            __startDrag: function (e) {
                var $dragger = $(e.target);
                var $column = $dragger.parent();
                this.$el.children().each(function (index, el) {
                    $(el).width($(el).width());
                });
                var affectedColumns = _.chain($column.nextAll()).toArray().map(function (el) {
                    return {
                        $el: $(el),
                        initialWidth: $(el).width()
                    };
                }).value();
                var draggedColumn = {
                    $el: $column,
                    initialWidth: $column.width(),
                    index: $column.index()
                };
                var unaffectedWidth = _.reduce($column.prevAll(), function (m, v) {
                    return m + $(v).width();
                }, 0);
                var fullWidth = this.$el.parent().width();//this.$el.width();

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
                console.log('maxColumnWidth',  this.dragContext.maxColumnWidth)
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

                    var newDraggerColumnWidth = Math.min(ctx.maxColumnWidth, Math.max(this.constants.MIN_COLUMN_WIDTH, draggedColumn.initialWidth + delta));
                    delta = newDraggerColumnWidth - draggedColumn.initialWidth;
                    draggedColumn.$el.width(newDraggerColumnWidth);

                    var newColumnWidthPc = newDraggerColumnWidth / ctx.fullWidth;
                    this.columns[index].width = changes[index] = newColumnWidthPc;
                    index++;

                    var affectedColumnsWidth = ctx.fullWidth - ctx.unaffectedWidth - draggedColumn.initialWidth,
                        sumDelta = 0,
                        sumGap = 0;

                    _.each(ctx.affectedColumns, function (c) {
                        var newColumnWidth = Math.floor(c.initialWidth - delta * c.initialWidth / affectedColumnsWidth);
                        if (newColumnWidth < this.constants.MIN_COLUMN_WIDTH) {
                            sumDelta += this.constants.MIN_COLUMN_WIDTH - newColumnWidth;
                            newColumnWidth = this.constants.MIN_COLUMN_WIDTH;
                        } else {
                            sumGap += newColumnWidth - this.constants.MIN_COLUMN_WIDTH;
                        }

                        var newColumnWidthPc = newColumnWidth / ctx.fullWidth;
                        this.columns[index].absWidth = newColumnWidth;
                        this.columns[index].width = changes[index] = newColumnWidthPc;
                        index++;
                    }, this);

                    index = ctx.draggedColumn.index + 1;
                    _.each(ctx.affectedColumns, function (c) {
                        if (sumDelta > 0 && this.columns[index].absWidth > this.constants.MIN_COLUMN_WIDTH) {
                            var delta = Math.ceil((this.columns[index].absWidth - this.constants.MIN_COLUMN_WIDTH) * sumDelta / sumGap);
                            this.columns[index].absWidth -= delta;
                            var newColumnWidthPc = this.columns[index].absWidth / ctx.fullWidth;
                            this.columns[index].width = changes[index] = newColumnWidthPc;
                        }

                        c.$el.width(this.columns[index].absWidth);
                        index++;
                    }, this);

                    this.gridEventAggregator.trigger('columnsResize', this, {
                        changes: changes,
                        fullWidth: ctx.fullWidth
                    });
                }

                return false;
            },

            __draggerMouseUp: function () {
                this.__stopDrag();
                return false;
            },

            __handleResize: function () {
                utils.helpers.setUniqueTimeout(this.__handleResizeInternal, this.__handleResizeInternal, 100);
            },

            __handleResizeInternal: function () {
                var fullWidth = this.$el.parent().width(),
                    columns = this.columns,
                    columnWidth = Math.floor(fullWidth / columns.length);

                this.ui.gridHeaderColumn.each(function (i, el) {
                    var child = $(el);
                    var col = columns[i];
                    if (col.width) {
                        child.width(Math.floor(col.width * fullWidth));
                    } else {
                        child.width(columnWidth);
                    }
                });
            }
        });

        return GridHeaderView;
    });
