/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

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

const NativeGridItemViewBehavior = Marionette.Behavior.extend({
    initialize(options, view) {
      helpers.ensureOption(view.options, 'columns');
      helpers.ensureOption(view.options, 'gridEventAggregator');
      helpers.ensureOption(view.options, 'internalListViewReqres');
      helpers.ensureOption(options, 'padding');

      this.padding = options.padding;
      this.listenTo(view.options.gridEventAggregator, 'columnsResize', this.__handleColumnsResize);
      this.columns = view.options.columns;

      this.listenTo(view, 'all', eventName => {
          if (eventBubblingIgnoreList.indexOf(eventName) !== -1) {
              return;
          }
          view.options.internalListViewReqres.request('childViewEvent', view, eventName, _.rest(arguments, 1));
      });

        this.paddingLeft = view.options.paddingLeft;
        this.paddingRight = view.options.paddingRight;
        this.padding = options.padding;
        this.listenTo(view.options.gridEventAggregator, 'columnStartDrag', this.__onColumnStartDrag);
        this.listenTo(view.options.gridEventAggregator, 'columnStoptDrag', this.__onColumnStopDrag);
        this.listenTo(view.options.gridEventAggregator, 'singleColumnResize', this.__onSingleColumnResize);
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

    __onColumnStartDrag(index) {
        const cells = this.__getCellElements();
        this.gridCellDragger = $(cells[index]);
        this.columnsWidth = [];
        cells.each((i, el) => {
            this.columnsWidth.push(this.__getElementOuterWidth(el));
        });
    },

    __onColumnStopDrag() {
        delete this.draggedColumn;
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

    __setInitialWidth() {
        this.__getCellElements().forEach((cell, i) => {
          cell.css('width', this.columns[i].width);
        });
    },

    __getElementOuterWidth(el) {
        return $(el)[0].getBoundingClientRect().width;
    },

    __onSingleColumnResize(newColumnWidth) {
        this.gridCellDragger.css('width', newColumnWidth);
    },

    __getAvailableWidth() {
        return this.el.css('wdith') - this.padding - 1; //Magic cross browser pixel, don't remove it
    },

    __getCellElements() {
        return this.$el.find('.js-grid-cell');
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

export default NativeGridItemViewBehavior;
