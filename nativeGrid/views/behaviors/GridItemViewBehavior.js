/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, Handlebars, _, $ */

define(['module/lib', 'core/utils/utilsApi'],
    function (lib, utils) {
        'use strict';
        var GridItemViewBehavior = Marionette.Behavior.extend({
            initialize: function (options, view)
            {
                if (!view.options.columns) {
                    throw new Error('`columns` option is required.');
                }
                if (!view.options.gridEventAggregator) {
                    throw new Error('`gridEventAggregator` option is required.');
                }

                this.padding = options.padding;
                _.bindAll(this, '__handleColumnsResize');
                this.listenTo(view.options.gridEventAggregator, 'columnStartDrag', this.__onColumnStartDrag);
                this.listenTo(view.options.gridEventAggregator, 'columnStoptDrag', this.__onColumnStopDrag);
                this.listenTo(view.options.gridEventAggregator, 'columnsResize', this.__handleColumnsResize);
                this.listenTo(view.options.gridEventAggregator, 'singleColumnResize', this.__onSingleColumnResize);

                this.columns = view.options.columns;
            },

            modelEvents: {
                'selected': '__handleSelection',
                'deselected': '__handleDeselection',
                'highlighted': '__handleHighlighting',
                'unhighlighted': '__handleUnhighlighting'
            },

            events: {
                'mousedown': '__handleClick'
            },

            ui: {
                cells: '.js-grid-cell'
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

            onRender: function () {
                var model = this.view.model;
                if (model.selected) {
                    this.__handleSelection();
                }
                if (model.highlighted) {
                    this.__highlight(model.highlightedFragment);
                }
                if (utils.htmlHelpers.isElementInDom(this.el)) {
                    Marionette.triggerMethodOn(this.view, 'show');
                }
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
                            cellWidth = $cell.width();

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

            __getAvailableWidth: function () {
                return this.$el.width() - this.padding;
            },
            
            __getCellElements: function () {
                return this.$el.find('.js-grid-cell');
            },

            __handleColumnsResize: function (sender, args)
            {
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
            },

            __handleClick: function (e)
            {
                var model = this.view.model;
                var selectFn = model.collection.selectSmart || model.collection.select;
                if (selectFn) {
                    selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey);
                }
            },

            __handleHighlighting: function (sender, e) {
                this.__highlight(e.text);
            },

            __highlight: function (fragment)
            {
                this.view.onHighlighted(fragment);
            },

            __handleUnhighlighting: function ()
            {
                this.view.onUnhighlighted();
            },

            __handleSelection: function () {
                this.$el.addClass('selected');
            },

            __handleDeselection: function () {
                this.$el.removeClass('selected');
            }
        });

        return GridItemViewBehavior;
    });
