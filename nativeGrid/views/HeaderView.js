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

define(['../../list/views/GridHeaderView'],
    function (GridHeaderView) {
        'use strict';
        var HeaderView = GridHeaderView.extend({
            initialize: function (options) {
                GridHeaderView.prototype.initialize.apply(this, arguments);
                this.columnsFit = options.columnsFit;
                _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResize', '__handleResizeInternal', '__handleColumnSort');
                $(window).resize(this.__handleResize);
            },

            onRender: function () {
                var self = this;
                this.ui.gridHeaderColumnContent.each(function (i, el) {
                    var column = self.columns[i];
                    var view = new self.gridColumnHeaderView(_.extend(self.gridColumnHeaderViewOptions || {}, {
                        model: column.viewModel,
                        column: column,
                        gridEventAggregator: self.gridEventAggregator
                    }));
                    self.listenTo(view, 'columnSort', self.__handleColumnSort);
                    var childEl = view.render().el;
                    el.appendChild(childEl);
                });
            },

            __setInitialWidth: function () {
                var columnsL = this.ui.gridHeaderColumn.length,
                    columnWidth = Math.floor(this.headerMinWidth / columnsL);

                this.ui.gridHeaderColumn.each(function (i, el) {
                    $(el).width(columnWidth);
                });
            },

            onShow: function () {
                this.headerMinWidth = this.$el.parent().width();
                this.__setInitialWidth();
                this.__handleResizeInternal();
            },

            __startDrag: function (e) {
                var $dragger = $(e.target);
                var $column = $dragger.parent();

                this.updateDragContext($column, e.pageX);
                this.dragContext.tableInitialWidth = $column.parent().width();

                this.dragContext.$dragger = $dragger;
                this.isPrevScroll = false;

                this.nextWidth = $column.next().width();

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

                this.gridEventAggregator.trigger('columnStopDrag');
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

                    var newDraggerColumnWidth = Math.max(this.constants.MIN_COLUMN_WIDTH, draggedColumn.initialWidth + delta);

                    if (this.columnsFit === 'scroll' && this.headerMinWidth < ctx.tableInitialWidth + delta) {

                        if (!this.isPrevScroll) {
                            this.updateDragContext(draggedColumn.$el, e.pageX);
                            this.isPrevScroll = true;
                        }

                        draggedColumn.$el.width(newDraggerColumnWidth);
                        this.columns[index].width = newDraggerColumnWidth;

                        var fullWidth = 0;
                        this.ui.gridHeaderColumn.each(function (i, el) {
                            fullWidth += $(el).width();
                        }.bind(this));

                        draggedColumn.$el.parent().width(fullWidth);

                        var absDelta = newDraggerColumnWidth - draggedColumn.initialWidth;

                        this.gridEventAggregator.trigger('singleColumnResize', this, {
                            index: index,
                            delta: absDelta,
                            needUpdate: true
                        });

                    } else {
                        this.updateColumnAndNeighbourWidths(index, delta);
                        if (this.isPrevScroll1) {
                            draggedColumn.$el.width(newDraggerColumnWidth);
                            draggedColumn.$el.parent().width(this.headerMinWidth);
                            this.updateDragContext(draggedColumn.$el, e.pageX);
                            this.isPrevScroll1 = false;

                            return false;
                        }
                    }
                }

                return false;
            },

            updateColumnAndNeighbourWidths: function (index, delta) {
                var $current = $(this.ui.gridHeaderColumn[index]),
                    $next = $(this.ui.gridHeaderColumn[index + 1]);

                if (this.dragContext.draggedColumn.initialWidth + delta < 20)
                    return;

                $current.width(this.dragContext.draggedColumn.initialWidth + delta);
                $next.width(this.nextWidth - delta);

                this.gridEventAggregator.trigger('singleColumnResize', this, {
                    index: index,
                    delta: delta
                });

                this.gridEventAggregator.trigger('singleColumnResize', this, {
                    index: index + 1,
                    delta: -delta
                });
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
                this.gridEventAggregator.trigger('columnStartDrag');

                this.dragContext.affectedColumns = affectedColumns;
                this.dragContext.fullWidth = this.headerMinWidth;
                this.dragContext.draggedColumn = draggedColumn;
                this.dragContext.pageOffsetX = offset;
                this.dragContext.unaffectedWidth = unaffectedWidth;
                this.dragContext.maxColumnWidth = this.headerMinWidth - affectedColumns.length * this.constants.MIN_COLUMN_WIDTH - unaffectedWidth;
            },

            __handleResizeInternal: function () {
                var fullWidth = this.$el.parent().width(),
                    currentWidth = this.$el.width();

                if (fullWidth > currentWidth) {
                    this.$el.width(fullWidth);
                }
                this.headerMinWidth = fullWidth;

                this.__updateColumnsWidth();
            },

            __updateColumnsWidth: function () {
                var columns = this.columns;
                this.ui.gridHeaderColumn.each(function (i, el)
                {
                    var child = $(el);
                    var col = columns[i];
                    if (col.width) {
                        child.width(col.width);
                    }
                });
            }
        });

        return HeaderView;
    });
