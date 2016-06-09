/**
 * Developer: Grigory Kuznetsov
 * Date: 22.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import GridItemViewBehavior from './behaviors/GridItemViewBehavior';
import GridItemBehavior from '../models/behaviors/GridItemBehavior';

let defaultOptions = {
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
        'click': '__onClick',
        'dblclick': '__onDblClick'
    },

    initialize: function () {
        _.defaults(this.options, defaultOptions);
        _.extend(this.model, new GridItemBehavior(this));
    },

    behaviors: {
        GridItemViewBehavior: {
            behaviorClass: GridItemViewBehavior,
            padding: 30
        }
    },

    getValue: function (id) {
        this.model.get(id);
    },

    _renderTemplate: function () {
        this.cellViews = [];
        this.$el.append('<div class="padding js-padding" style="width: ' + this.options.paddingLeft + 'px"></div>');
        _.each(this.options.columns, function (gridColumn) {
            var id = gridColumn.id,
                value;

            if (gridColumn.cellViewOptions && gridColumn.cellViewOptions.getValue) {
                value = gridColumn.cellViewOptions.getValue.apply(this, [gridColumn]);
            } else {
                value = this.model.get(id);
            }

            var cellView = new gridColumn.cellView({
                className: 'grid-cell js-grid-cell',
                model: new Backbone.Model({
                    value: value,
                    rowModel: this.model,
                    columnConfig: gridColumn,
                    highlightedFragment: null
                }),
                gridEventAggregator: this.options.gridEventAggregator
            });
            cellView.render();
            cellView.$el.addClass('js-grid-cell').appendTo(this.$el);
            this.cellViews.push(cellView);
        }, this);
        this.$el.append('<div class="padding js-padding" style="width: ' + this.options.paddingRight + 'px"></div>');
    },

    onHighlighted: function (fragment)
    {
        _.each(this.cellViews, function (cellView) {
            cellView.model.set('highlightedFragment', fragment);
        });
    },

    onUnhighlighted: function ()
    {
        _.each(this.cellViews, function (cellView) {
            cellView.model.set('highlightedFragment', null);
        });
    },

    __onClick: function () {
        this.trigger('click', this.model);
    },

    __onDblClick: function () {
        this.trigger('dblclick', this.model);
    }
});
