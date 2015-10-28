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

define(['../../list/views/GridHeaderView', 'text!../templates/header.html'],
    function (GridHeaderView, template) {
        'use strict';

        var HeaderView = GridHeaderView.extend({
            initialize: function (options) {
                GridHeaderView.prototype.initialize.apply(this, arguments);
                this.columnsFit = options.columnsFit;
                _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResize', '__handleResizeInternal', '__handleColumnSort');
                $(window).resize(this.__handleResize);
            },

            template: Handlebars.compile(template),

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

            setFitToView: function () {
                var availableWidth = this.$el.parent().width(),
                    viewWidth = this.$el.width();

                this.ui.gridHeaderColumn.each(function (i, el) {
                    var columnWidth = Math.floor($(el).width() * availableWidth / viewWidth);
                    $(el).width(columnWidth);
                    this.columns[i].width = columnWidth;
                }.bind(this));

                this.$el.width(availableWidth);
            },

            __setInitialWidth: function (fullWidth) {
                var columnsL = this.ui.gridHeaderColumn.length,
                    columnWidth = Math.floor(fullWidth / columnsL),
                    fullWidth = 0;

                this.ui.gridHeaderColumn.each(function (i, el) {
                    if (this.columns[i].width)
                        columnWidth = this.columns[i].width;

                    $(el).width(columnWidth);
                    this.columns[i].width = columnWidth;
                    fullWidth += columnWidth;
                }.bind(this));

                this.$el.width(fullWidth);
            },

            onShow: function () {
                this.headerMinWidth = this.$el.parent().width();
                this.__setInitialWidth(this.headerMinWidth);
                this.__handleResizeInternal();
            },

            __startDrag: function (e) {
                var $dragger = $(e.target);
                var $column = $dragger.parent();

                this.updateDragContext($column, e.pageX);
                this.dragContext.tableInitialWidth = $column.parent().width();

                this.dragContext.$dragger = $dragger;

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
                    var index = ctx.draggedColumn.index;

                    this.updateColumnAndNeighbourWidths(index, delta);
                }

                return false;
            },

            updateColumnAndNeighbourWidths: function (index, delta) {
                var $current = $(this.ui.gridHeaderColumn[index]),
                    newColumnWidth = this.dragContext.draggedColumn.initialWidth + delta;

                if (this.dragContext.draggedColumn.initialWidth + delta < 20) {
                    return;
                }

                $current.width(newColumnWidth);
                this.gridEventAggregator.trigger('singleColumnResize', this, {
                    index: index,
                    delta: delta
                });

                this.$el.width(this.dragContext.tableInitialWidth + delta);
                this.columns[index].width = newColumnWidth;
            },

            updateDragContext: function ($column, offset) {
                this.dragContext = this.dragContext || {};

                var draggedColumn = {
                    $el: $column,
                    initialWidth: $column.width(),
                    index: $column.index()
                };

                this.dragContext.tableInitialWidth = $column.parent().width();
                this.gridEventAggregator.trigger('columnStartDrag');

                this.dragContext.fullWidth = this.headerMinWidth;
                this.dragContext.draggedColumn = draggedColumn;
                this.dragContext.pageOffsetX = offset;
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
                var columns = this.columns,
                    needUpdate = false,
                    fullWidth = 0;

                this.ui.gridHeaderColumn.each(function (i, el) {
                    var child = $(el);
                    var col = columns[i];
                    if (col.width) {
                        needUpdate = true;
                        child.width(col.width);
                        fullWidth += col.width;
                    }
                });

                needUpdate && this.$el.width(fullWidth);
            }
        });

        return HeaderView;
    });
