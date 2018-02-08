/**
 * Developer: Grigory Kuznetsov
 * Date: 22.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import GridItemViewBehavior from './behaviors/GridItemViewBehavior';
import GridItemBehavior from '../models/behaviors/GridItemBehavior';

const defaultOptions = {
    paddingLeft: 20,
    paddingRight: 10
};

/**
 * Some description for initializer
 * @name RowView
 * @memberof module:core.list.views
 * @class RowView
 * @extends Marionette.ItemView
 * @constructor
 * @description View используемый по умолчанию для отображения строки списка
 * @param {Object} options Constructor options
 * @param {Array} options.columns Массив колонк
 * @param {Object} options.gridEventAggregator ?
 * @param {Number} [options.paddingLeft=20] Левый отступ
 * @param {Number} [options.paddingRight=10] Правый отступ
 * */
export default Marionette.ItemView.extend({
    className: 'record-row grid-row',

    events: {
        click: '__onClick',
        dblclick: '__onDblClick'
    },

    initialize() {
        _.defaults(this.options, defaultOptions);
        _.extend(this.model, new GridItemBehavior(this));
    },

    behaviors: {
        GridItemViewBehavior: {
            behaviorClass: GridItemViewBehavior,
            padding: 30
        }
    },

    getValue(id) {
        this.model.get(id);
    },

    _renderTemplate() {
        this.cellViews = [];
        this.options.columns.forEach((gridColumn, index) => {
            const id = gridColumn.id;
            let value;

            if (gridColumn.cellViewOptions && gridColumn.cellViewOptions.getValue) {
                value = gridColumn.cellViewOptions.getValue.apply(this, [gridColumn]);
            } else {
                value = this.model.get(id);
            }

            const cellView = new gridColumn.cellView({
                className: `grid-cell js-grid-cell ${this.getOption('uniqueId')}-column${index}`,
                model: new Backbone.Model({
                    value,
                    rowModel: this.model,
                    columnConfig: gridColumn,
                    highlightedFragment: null
                }),
                gridEventAggregator: this.options.gridEventAggregator
            });
            cellView.render();
            cellView.$el.addClass('js-grid-cell').appendTo(this.$el);
            this.cellViews.push(cellView);
        });
    },

    onDestroy() {
        if (this.cellViews) {
            this.cellViews.forEach(x => x.destroy());
        }
    },

    onHighlighted(fragment) {
        this.cellViews.forEach(cellView => {
            cellView.model.set('highlightedFragment', fragment);
        });
    },

    onUnhighlighted() {
        this.cellViews.forEach(cellView => {
            cellView.model.set('highlightedFragment', null);
        });
    },

    __onClick() {
        this.trigger('click', this.model);
    },

    __onDblClick() {
        this.trigger('dblclick', this.model);
    }
});
