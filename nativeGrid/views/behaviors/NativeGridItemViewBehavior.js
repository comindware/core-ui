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

        var constants = {
          leftPadding: 20
        };

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

            __setInitialWidth: function () {
                var $cells = this.__getCellElements(),
                    availableWidth = this.__getAvailableWidth() - constants.leftPadding,
                    cellWidth = Math.floor(availableWidth / $cells.length) - this.padding;

                for (var i = 0; i < $cells.length; i++) {
                    var $cell = $($cells[i]);
                    $cell.width(cellWidth);
                }
            },

            onShow: function () {
                this.__setInitialWidth();
            },

            __handleColumnsResize: function (sender, args) {
                var availableWidth = args.fullWidth;
                var cells = _.toArray(this.__getCellElements());
                _.each(args.changes, function (v, k)
                {
                    var $cell = $(cells[k]);
                    $cell.width(v * availableWidth - this.cellWidthDiff);
                }, this);

                this.view.options.gridEventAggregator.trigger('afterColumnsResize', args.fullWidth);
            },

            __onSingleColumnResize: function (sender, args) {
                var cells = _.toArray(this.__getCellElements()),
                    $cell = $(cells[args.index]);

                $cell.width(this.columnsWidth[args.index] + args.delta);

                var fullWidth = 0;
                this.__getCellElements().each(function (i, el) {
                    fullWidth += $(el).width() + 20;
                }.bind(this));

                this.view.options.gridEventAggregator.trigger('afterColumnsResize', fullWidth);
            }
        });

        return NativeGridItemViewBehavior;
    });
