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

/* global define, require, Marionette, Handlebars, _, $ */

define(['module/lib', 'core/utils/utilsApi', '../../../list/views/behaviors/GridItemViewBehavior'],
    function (lib, utils, GridItemViewBehavior) {
        'use strict';
        var NativeGridItemViewBehavior = GridItemViewBehavior.extend({
            initialize: function (options, view)
            {
                GridItemViewBehavior.prototype.initialize.apply(this, arguments);

                this.padding = options.padding;
                this.listenTo(view.options.gridEventAggregator, 'columnStartDrag', this.__onColumnStartDrag);
                this.listenTo(view.options.gridEventAggregator, 'columnStoptDrag', this.__onColumnStopDrag);
                this.listenTo(view.options.gridEventAggregator, 'singleColumnResize', this.__onSingleColumnResize);
            },

            __onColumnStartDrag: function (sender, index) {
                var cells = this.__getCellElements();
                this.columnsWidth = [];
                cells.each(function (i, el) {
                    this.columnsWidth.push($(el).width());
                }.bind(this));
                this.initialFullWidth = this.$el.parent().width();
            },

            __onColumnStopDrag: function () {
                delete this.draggedColumn;
            },

            onShow: function () {
                var $cells = this.__getCellElements();
                var cells = _.toArray($cells);
                if (this.view.options.columnsFit === 'scroll') {
                    var fullWidth = 0;
                    var columnsWidth = [];
                    this.cellWidthDiff = $cells.outerWidth() - $cells.width();
                    _.each(this.columns, function (c, k) {
                        var $cell = $(cells[k]),
                            cellWidth = $cell.outerWidth();

                        columnsWidth.push(cellWidth);
                        $cell.width(cellWidth);
                        fullWidth += cellWidth;
                    }, this);
                    this.$el.width(fullWidth);
                    this.view.options.gridEventAggregator.trigger('columnsSetWidth', {columns: columnsWidth, fullWidth: fullWidth});
                } else {
                    this.cellWidthDiff = $cells.outerWidth() - $cells.width();
                    var availableWidth = this.__getAvailableWidth();

                    _.each(this.columns, function (c, k) {
                        var $cell = $(cells[k]);
                        if (c.width) {
                            $cell.width(c.width * availableWidth - this.cellWidthDiff);
                        }
                    }, this);
                }
            },

            __handleColumnsResize: function (sender, args) {
                var availableWidth = args.fullWidth;
                var cells = _.toArray(this.__getCellElements());
                _.each(args.changes, function (v, k)
                {
                    var $cell = $(cells[k]);
                    $cell.width(v * availableWidth - this.cellWidthDiff);
                }, this);

                this.view.options.gridEventAggregator.trigger('listResized', args.fullWidth);
            },

            __onSingleColumnResize: function (sender, args) {
                var cells = _.toArray(this.__getCellElements()),
                    $cell = $(cells[args.index]);

                var fullWidth = this.initialFullWidth + args.delta;
                $cell.width(this.columnsWidth[args.index] + args.delta);

                this.view.options.gridEventAggregator.trigger('listResized', fullWidth);
            }
        });

        return NativeGridItemViewBehavior;
    });
