/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers, htmlHelpers } from 'utils';

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(view.options, 'columns');
        helpers.ensureOption(view.options, 'gridEventAggregator');

        this.padding = options.padding;
        // this.listenTo(view.options.gridEventAggregator, 'columnsResize', this.__handleColumnsResize);
        this.columns = view.options.columns;

        this.paddingLeft = view.options.paddingLeft;
        this.paddingRight = view.options.paddingRight;
        this.padding = options.padding;
        // this.listenTo(view.options.gridEventAggregator, 'columnStartDrag', this.__onColumnStartDrag);
        // this.listenTo(view.options.gridEventAggregator, 'singleColumnResize', this.__onSingleColumnResize);
        this.view.setFitToView = this.setFitToView.bind(this);
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

    setFitToView() {
        this.__setInitialWidth();
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

        this.__setInitialWidth();
    },

    __onColumnStartDrag(index) {
        const cells = this.__getCellElements();
        this.gridCellDragger = cells[index];
    },

    __setInitialWidth() {
        //this.__getCellElements().forEach((cell, i) => cell.style.width = `${this.columns[i].width}px`);
    },

    __getElementOuterWidth(el) {
        return $(el)[0].getBoundingClientRect().width;
    },

    __onSingleColumnResize() {
        //this.gridCellDragger.style.width = `${newColumnWidth}px`;
    },

    __getAvailableWidth() {
        return this.el.style.width - this.padding - 1; //Magic cross browser pixel, don't remove it
    },

    __getCellElements() {
        return Array.prototype.slice.call(this.el.querySelectorAll('.js-grid-cell')); //IE11 fix
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
