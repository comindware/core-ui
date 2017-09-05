/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';
import { helpers, htmlHelpers } from 'utils';

const eventBubblingIgnoreList = [
    'before:render',
    'render',
    'dom:refresh',
    'before:show',
    'show',
    'before:destroy',
    'destroy'
];

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(view.options, 'columns');
        helpers.ensureOption(view.options, 'gridEventAggregator');
        helpers.ensureOption(view.options, 'internalListViewReqres');
        helpers.ensureOption(options, 'padding');

        this.padding = options.padding;
        _.bindAll(this, '__handleColumnsResize');
        this.listenTo(view.options.gridEventAggregator, 'columnsResize', this.__handleColumnsResize);
        this.columns = view.options.columns;

        this.listenTo(view, 'all', function(eventName) {
            if (eventBubblingIgnoreList.indexOf(eventName) !== -1) {
                return;
            }
            view.options.internalListViewReqres.request('childViewEvent', view, eventName, _.rest(arguments, 1));
        });
    },

    modelEvents: {
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        highlighted: '__handleHighlighting',
        unhighlighted: '__handleUnhighlighting'
    },

    events: {
        mousedown: '__handleClick'
    },

    ui: {
        cells: '.js-grid-cell'
    },

    onRender() {
        const model = this.view.model;
        if (model.selected) {
            this.__handleSelection();
        }
        if (model.highlighted) {
            this.__highlight(model.highlightedFragment);
        }
        if (htmlHelpers.isElementInDom(this.el)) {
            Marionette.triggerMethodOn(this.view, 'show');
        }
    },

    onShow() {
        this.__handleColumnsResize();
    },

    __getAvailableWidth() {
        return this.$el.width() - this.padding - 1; //Magic cross browser pixel, don't remove it
    },

    __getCellElements() {
        return this.$el.find('.js-grid-cell');
    },

    __handleColumnsResize() {
        const cells = _.toArray(this.__getCellElements());
        _.each(this.columns, (col, k) => {
            const $cell = $(cells[k]);
            $cell.outerWidth(col.absWidth);
        }, this);
    },

    __handleClick(e) {
        const model = this.view.model;
        const selectFn = model.collection.selectSmart || model.collection.select;
        if (selectFn) {
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey);
        }
    },

    __handleHighlighting(sender, e) {
        this.__highlight(e.text);
    },

    __highlight(fragment) {
        this.view.onHighlighted(fragment);
    },

    __handleUnhighlighting() {
        this.view.onUnhighlighted();
    },

    __handleSelection() {
        this.$el.addClass('selected');
    },

    __handleDeselection() {
        this.$el.removeClass('selected');
    }
});
