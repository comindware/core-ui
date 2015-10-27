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

                this.paddingLeft = view.options.paddingLeft;
                this.paddingRight = view.options.paddingRight;
                this.padding = options.padding;
                this.listenTo(view.options.gridEventAggregator, 'columnStartDrag', this.__onColumnStartDrag);
                this.listenTo(view.options.gridEventAggregator, 'columnStoptDrag', this.__onColumnStopDrag);
                this.listenTo(view.options.gridEventAggregator, 'singleColumnResize', this.__onSingleColumnResize);
                this.view.setFitToView = this.setFitToView.bind(this);
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
                this.__setInitialWidth(true);
            },

            setFitToView: function () {
                this.__setInitialWidth();
            },

            __setInitialWidth: function (enableCustomWidth) {
                var $cells = this.__getCellElements(),
                    availableWidth = this.$el.parent().width() - this.paddingLeft - this.paddingRight,
                    cellWidth = Math.floor(availableWidth / $cells.length),
                    fullWidth = 0;

                for (var i = 0; i < $cells.length; i++) {
                    var $cell = $($cells[i]);

                    if (enableCustomWidth && this.columns[i].width) {
                        cellWidth = this.columns[i].width;
                    }

                    $cell.width(cellWidth - this.padding);
                    this.columns[i].width = cellWidth;
                    fullWidth += cellWidth;
                }

                fullWidth += this.paddingLeft + this.paddingRight;
                this.$el.width(fullWidth);
                this.view.options.gridEventAggregator.trigger('afterColumnsResize', fullWidth);
            },

            __onSingleColumnResize: function (sender, args) {
                var cells = _.toArray(this.__getCellElements()),
                    $cell = $(cells[args.index]);

                $cell.width(this.columnsWidth[args.index] + args.delta);

                var fullWidth = 0;
                this.__getCellElements().each(function (i, el) {
                    fullWidth += $(el).width() + this.padding;
                }.bind(this));

                fullWidth += this.paddingLeft + this.paddingRight;

                this.$el.width(fullWidth);

                this.view.options.gridEventAggregator.trigger('afterColumnsResize', fullWidth);
            }
        });

        return NativeGridItemViewBehavior;
    });
