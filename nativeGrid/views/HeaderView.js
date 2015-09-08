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
                _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResize', '__handleResizeInternal', '__handleColumnSort', '__setColumnsWidth');
                $(window).resize(this.__handleResize);

                this.listenTo(this.gridEventAggregator, 'columnsSetWidth', this.__setColumnsWidth);
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

            onShow: function () {
                this.__handleResizeInternal();
                this.headerMinWidth = this.$el.parent().width();
            },

            __startDrag: function (e) {
                var $dragger = $(e.target);
                var $column = $dragger.parent();

                this.updateDragContext($column, e.pageX);

                this.dragContext.$dragger = $dragger;
                this.isPrevScroll = false;

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
                    delta = newDraggerColumnWidth - draggedColumn.initialWidth;

                    if (this.columnsFit === 'scroll' && this.headerMinWidth < ctx.tableInitialWidth + delta) {
                        if (!this.isPrevScroll) {
                            this.updateDragContext(draggedColumn.$el, e.pageX);
                            this.isPrevScroll = true;
                            return false;
                        }
                        var tableWidth = Math.max(this.headerMinWidth, this.headerMinWidth + delta);
                        draggedColumn.$el.parent().width(tableWidth);
                        draggedColumn.$el.width(newDraggerColumnWidth);
                        this.columns[index].width = newDraggerColumnWidth;
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
                        this.columns[index].width = newDraggerColumnWidth;
                        changes[index] = newColumnWidthPc;
                        index++;

                        var affectedColumnsWidth = ctx.fullWidth - ctx.unaffectedWidth - draggedColumn.initialWidth;

                        _.each(ctx.affectedColumns, function (c) {
                            var newColumnWidth = Math.max(c.initialWidth - delta * c.initialWidth / affectedColumnsWidth, this.constants.MIN_COLUMN_WIDTH);
                            c.$el.width(newColumnWidth);

                            var newColumnWidthPc = newColumnWidth / ctx.fullWidth;
                            this.columns[index].width = newColumnWidth;
                            changes[index] = newColumnWidthPc;
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

            __handleResizeInternal: function () {
                var fullWidth = this.$el.parent().width(),
                    currentWidth = this.$el.width();

                if (fullWidth > currentWidth) {
                    this.$el.width(fullWidth);
                }
                this.headerMinWidth = fullWidth;
            },

            __setColumnsWidth: function (opts) {
                _.each(this.columns, function (col, i) {
                    var $col = $(this.ui.gridHeaderColumn[i]);
                    col.width = opts.columns[i];
                    $col.width(col.width);
                }.bind(this));
            }
        });

        return HeaderView;
    });
