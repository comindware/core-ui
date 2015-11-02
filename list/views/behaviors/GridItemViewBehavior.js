/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
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

        var eventBubblingIgnoreList = [
            'before:render',
            'render',
            'dom:refresh',
            'before:show',
            'show',
            'before:destroy',
            'destroy'
        ];

        return Marionette.Behavior.extend({
            initialize: function (options, view)
            {
                utils.helpers.ensureOption(view.options, 'columns');
                utils.helpers.ensureOption(view.options, 'gridEventAggregator');
                utils.helpers.ensureOption(view.options, 'internalListViewReqres');
                utils.helpers.ensureOption(options, 'padding');

                this.padding = options.padding;
                _.bindAll(this, '__handleColumnsResize');
                this.listenTo(view.options.gridEventAggregator, 'columnsResize', this.__handleColumnsResize);
                this.columns = view.options.columns;

                this.listenTo(view, 'all', function (eventName) {
                    if (eventBubblingIgnoreList.indexOf(eventName) !== -1) {
                        return;
                    }
                    view.options.internalListViewReqres.request('childViewEvent', view, eventName, _.rest(arguments, 1));
                });
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
                this.cellWidthDiff = $cells.outerWidth() - $cells.width();
                var availableWidth = this.__getAvailableWidth();
                var cells = _.toArray($cells);
                _.each(this.columns, function (c, k)
                {
                    var $cell = $(cells[k]);
                    if (c.width) {
                        $cell.width(c.width * availableWidth - this.cellWidthDiff);
                    }
                }, this);
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
            },

            __handleClick: function (e)
            {
                var model = this.view.model;
                var selectFn = model.collection.selectSmart || model.collection.select;
                if (selectFn) {
                    selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey);
                }
            },

            __handleHighlighting: function (sender, e)
            {
                this.__highlight(e.text);
            },

            __highlight: function (fragment)
            {
                this.view.OnHighlighted(fragment);
            },

            __handleUnhighlighting: function ()
            {
                this.view.OnUnhighlighted();
            },

            __handleSelection: function () {
                this.$el.addClass('selected');
            },

            __handleDeselection: function () {
                this.$el.removeClass('selected');
            }
        });
    });
