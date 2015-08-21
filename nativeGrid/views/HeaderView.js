/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, _, Handlebars, shared, $ */

define(['text!../templates/header.html', 'module/lib', 'core/utils/utilsApi'],
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
                if (!options.columnHeaderView) {
                    throw new Error('You must provide grid column header view ("columnHeaderView" option)');
                }

                this.gridEventAggregator = options.gridEventAggregator;
                this.columnHeaderView = options.columnHeaderView;
                this.columnHeaderViewOptions = options.gridColumnHeaderViewOptions;
                this.columns = options.columns;
                this.$document = $(document);
                _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResize', '__handleResizeInternal', '__handleColumnSort', '__setColumnsWidth');
                $(window).resize(this.__handleResize);

                this.listenTo(this.gridEventAggregator, 'columnsSetWidth', this.__setColumnsWidth);
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

            onRender: function ()
            {
                var self = this;
                this.ui.gridHeaderColumnContent.each(function (i, el)
                {
                    var column = self.columns[i];
                    var view = new self.columnHeaderView(_.extend(self.columnHeaderViewOptions || {}, {
                        model: column.viewModel,
                        column: column
                    }));
                    self.listenTo(view, 'columnSort', self.__handleColumnSort);
                    var childEl = view.render().el;
                    el.appendChild(childEl);
                });
            },

            onShow: function ()
            {
                this.__handleResizeInternal();
                this.headerMinWidth = this.$el.parent().width();
            },

            onDestroy: function () {
                $(window).off('resize');
            },

            updateSorting: function ()
            {
                this.render();
                this.__handleResizeInternal();
            },

            __handleColumnSort: function (sender, args)
            {
                var column = args.column;
                var sorting = column.sorting;
                var comparator;
                _.each(this.columns, function (c)
                {
                    c.sorting = null;
                });
                switch (sorting)
                {
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

            __handleDraggerMousedown: function (e)
            {
                this.__stopDrag();
                this.__startDrag(e);
                return false;
            },

            __startDrag: function (e)
            {
                var $dragger = $(e.target);
                var $column = $dragger.parent();

                this.updateDragContext($column, e.pageX)

                this.dragContext.$dragger = $dragger;
                this.isPrevScroll = true;

                this.originalDragContext = {};
                $dragger.addClass('active');
                this.$document.mousemove(this.__draggerMouseMove).mouseup(this.__draggerMouseUp);
            },

            __stopDrag: function ()
            {
                if (!this.dragContext) {
                    return;
                }

                this.dragContext.$dragger.removeClass('active');
                this.dragContext = null;
                this.$document.unbind('mousemove', this.__draggerMouseMove);
                this.$document.unbind('mouseup', this.__draggerMouseUp);

                this.gridEventAggregator.trigger('columnStopDrag');
            },

            __draggerMouseMove: function (e)
            {
                if (!this.dragContext) {
                    return;
                }

                var ctx = this.dragContext;
                var delta = e.pageX - ctx.pageOffsetX;

                if (delta !== 0) {
                    var draggedColumn = ctx.draggedColumn;
                    var index = ctx.draggedColumn.index;
                    var changes = {};

                    var newDraggerColumnWidth = Math.max(this.constants.MIN_COLUMN_WIDTH, draggedColumn.initialWidth + delta);
                    delta = newDraggerColumnWidth - draggedColumn.initialWidth;

                    if (this.headerMinWidth < ctx.tableInitialWidth + delta) {
                        if (!this.isPrevScroll) {
                            this.updateDragContext(draggedColumn.$el, e.pageX);
                            this.isPrevScroll = true;
                            return false;
                        }
                        this.isPrevScroll = true;

                        var tableWidth = Math.max(this.headerMinWidth, this.headerMinWidth + delta);
                        draggedColumn.$el.parent().width(tableWidth);
                        draggedColumn.$el.width(newDraggerColumnWidth);
                        this.gridEventAggregator.trigger('singleColumnResize', this, {
                            index: index,
                            delta: delta
                        });
                    } else {
                        if (this.isPrevScroll) {
                            draggedColumn.$el.width(newDraggerColumnWidth);
                            draggedColumn.$el.parent().width(this.headerMinWidth);
                            this.updateDragContext(draggedColumn.$el, e.pageX);
                            this.isPrevScroll = false;

                            return false;
                        }

                        delta = newDraggerColumnWidth - draggedColumn.initialWidth;
                        draggedColumn.$el.width(newDraggerColumnWidth);

                        var newColumnWidthPc = newDraggerColumnWidth / ctx.fullWidth;
                        this.columns[index].width = changes[index] = newColumnWidthPc;
                        index++;

                        var affectedColumnsWidth = ctx.fullWidth - ctx.unaffectedWidth - draggedColumn.initialWidth;

                        _.each(ctx.affectedColumns, function (c) {
                            var newColumnWidth = Math.max(c.initialWidth - delta * c.initialWidth / affectedColumnsWidth, this.constants.MIN_COLUMN_WIDTH);
                            c.$el.width(newColumnWidth);

                            var newColumnWidthPc = newColumnWidth / ctx.fullWidth;
                            this.columns[index].width = changes[index] = newColumnWidthPc;
                            index++;
                        }, this);

                        this.gridEventAggregator.trigger('columnsResize', this, {
                            changes: changes,
                            fullWidth: ctx.fullWidth
                        });
                    }
                }

                return false;
            },

            updateDragContext: function ($column, offset) {
                this.dragContext = this.dragContext || {};

                var draggedColumn = {
                    $el: $column,
                    initialWidth: $column.width(),
                    index: $column.index()
                };

                var affectedColumns = _.chain(draggedColumn.$el.nextAll()).toArray().map(function (el) {
                        return {
                            $el: $(el),
                            initialWidth: $(el).width()
                        };
                    }).value(),
                    unaffectedWidth = _.reduce(draggedColumn.$el.prevAll(), function (m, v) {
                        return m + $(v).width();
                    }, 0);

                this.dragContext.tableInitialWidth = $column.parent().width();
                this.dragContext.affectedColumns = affectedColumns;
                this.dragContext.fullWidth = this.headerMinWidth;
                this.dragContext.draggedColumn = draggedColumn;
                this.dragContext.pageOffsetX = offset;
                this.dragContext.unaffectedWidth = unaffectedWidth;
                this.dragContext.maxColumnWidth = this.headerMinWidth - affectedColumns.length * this.constants.MIN_COLUMN_WIDTH - unaffectedWidth;
                this.gridEventAggregator.trigger('columnStartDrag');
            },

            __draggerMouseUp: function ()
            {
                this.__stopDrag();
                return false;
            },

            __handleResize: function () {
                debugger;
                this.headerMinWidth = this.$el.parent().width();
                utils.helpers.setUniqueTimeout(this.__handleResizeInternal, this.__handleResizeInternal, 100);
            },

            __handleResizeInternal: function ()
            {
                debugger;
                this.$el.width(this.headerMinWidth);
                var columns = this.columns;
                this.ui.gridHeaderColumn.each(function (i, el)
                {
                    var child = $(el);
                    var col = columns[i];
                });
            },

            __setColumnsWidth: function (opts) {
                _.each(this.columns, function (col, i) {
                    var $col = $(this.ui.gridHeaderColumn[i]);
                    col.width = opts.columns[i];
                    $col.width(col.width);
                }.bind(this));
            }
        });

        return GridHeaderView;
    });
