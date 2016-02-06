/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import template from '../templates/header.hbs';
import '../../libApi';
import GridHeaderView from '../../list/views/GridHeaderView';
import GlobalEventService from '../../services/GlobalEventService';

/**
 * @name HeaderView
 * @memberof module:core.nativeGrid.views
 * @class HeaderView
 * @description View заголовка списка
 * @extends module:core.list.views.GridHeaderView {@link module:core.list.views.GridHeaderView}
 * @param {Object} options Constructor options
 * @param {Array} options.columns Массив колонок
 * @param {Object} options.gridEventAggregator ?
 * @param {Backbone.View} options.gridColumnHeaderView View Используемый для отображения заголовка (шапки) списка
 * */
let HeaderView = GridHeaderView.extend({
    initialize: function (options) {
        GridHeaderView.prototype.initialize.apply(this, arguments);
        _.bindAll(this, '__draggerMouseUp', '__draggerMouseMove', '__handleResize', '__handleResizeInternal', '__handleColumnSort');
        this.listenTo(GlobalEventService, 'resize', this.__handleResize);
    },

    template: template,

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

    __getAvailableWidth: function () {
        return this.$el.parent().width() - 1;
    },

    __getElementOuterWidth: function (el) {
        return $(el)[0].getBoundingClientRect().width;
    },

    setFitToView: function () {
        var availableWidth = this.__getAvailableWidth(),
            viewWidth = this.__getTableWidth(),
            columnsL = this.ui.gridHeaderColumn.length,
            fullWidth = 0,
            sumDelta = 0,
            sumGap = 0;

        this.ui.gridHeaderColumn.each(function (i, el) {
            if (availableWidth !== viewWidth) {
                var columnWidth = this.__getElementOuterWidth(el) * availableWidth / viewWidth;
                if (columnWidth < this.constants.MIN_COLUMN_WIDTH) {
                    sumDelta += this.constants.MIN_COLUMN_WIDTH - columnWidth;
                    columnWidth = this.constants.MIN_COLUMN_WIDTH;
                } else {
                    sumGap += columnWidth - this.constants.MIN_COLUMN_WIDTH;
                }
            }

            this.columns[i].width = columnWidth;
        }.bind(this));

        this.ui.gridHeaderColumn.each(function (i, el) {
            if (availableWidth !== viewWidth) {
                if (this.columns[i].width > this.constants.MIN_COLUMN_WIDTH) {
                    var delta = (this.columns[i].width - this.constants.MIN_COLUMN_WIDTH) * sumDelta / sumGap;
                    this.columns[i].width -= delta;
                }
            }

            if (i === columnsL - 1 && fullWidth + this.columns[i].width < availableWidth) {
                this.columns[i].width = availableWidth - fullWidth;
            }

            $(el).outerWidth(this.columns[i].width);
            fullWidth += this.columns[i].width;

        }.bind(this));
        this.$el.width(Math.ceil(fullWidth));
    },

    __setInitialWidth: function (availableWidth) {
        var columnsL = this.ui.gridHeaderColumn.length,
            columnWidth = availableWidth / columnsL,
            fullWidth = 0;

        this.ui.gridHeaderColumn.each(function (i, el) {
            if (this.columns[i].width)
                columnWidth = this.columns[i].width;

            if (i === columnsL - 1 && fullWidth + this.columns[i].width < availableWidth) {
                this.columns[i].width = availableWidth - fullWidth;
            }

            $(el).outerWidth(columnWidth);
            this.columns[i].width = columnWidth;
            fullWidth += columnWidth;
        }.bind(this));

        this.$el.width(Math.ceil(fullWidth));
    },

    onShow: function () {
        this.headerMinWidth = this.__getAvailableWidth();
        this.__setInitialWidth(this.headerMinWidth);
        this.__handleResizeInternal();
    },

    __startDrag: function (e) {
        var $dragger = $(e.target);
        var $column = $dragger.parent();

        this.updateDragContext($column, e.pageX);
        this.dragContext.tableInitialWidth = this.__getTableWidth();

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

        $current.outerWidth(newColumnWidth);
        this.gridEventAggregator.trigger('singleColumnResize', this, {
            index: index,
            delta: delta
        });

        this.__changeTableWidth(this.dragContext.tableInitialWidth, delta);
        this.columns[index].width = newColumnWidth;
    },

    __changeTableWidth: function (initialWidth, delta) {
        this.$el.width(initialWidth + delta + 1);
    },

    updateDragContext: function ($column, offset) {
        this.dragContext = this.dragContext || {};

        var draggedColumn = {
            $el: $column,
            initialWidth: this.__getElementOuterWidth($column),
            index: $column.index()
        };

        this.dragContext.tableInitialWidth = this.__getTableWidth();
        this.gridEventAggregator.trigger('columnStartDrag');

        this.dragContext.fullWidth = this.headerMinWidth;
        this.dragContext.draggedColumn = draggedColumn;
        this.dragContext.pageOffsetX = offset;
    },

    __getTableWidth: function () {
        return this.$el.width() - 1;
    },

    __handleResizeInternal: function () {
        var fullWidth = this.__getAvailableWidth(),
            currentWidth = this.__getTableWidth();

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
                child.outerWidth(col.width);
                fullWidth += col.width;
            }
        });

        needUpdate && this.$el.width(fullWidth);
    }
});

export default HeaderView;
