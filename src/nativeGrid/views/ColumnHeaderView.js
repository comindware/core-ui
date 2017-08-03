/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import template from '../templates/columnHeader.hbs';
import { Handlebars } from 'lib';
import GridColumnHeaderView from '../../list/views/GridColumnHeaderView';

/**
 * @name ColumnHeaderView
 * @memberof module:core.nativeGrid.views
 * @class ColumnHeaderView
 * @constructor
 * @description View для отображения ячейки заголовка (шапки) списка
 * @extends module:core.list.views.GridColumnHeaderView {@link module:core.list.views.GridColumnHeaderView}
 * @param {Object} options Constructor options
 * @param {Array} options.columns Массив колонок
 * @param {} options.gridEventAggregator ?
 * */
const ColumnHeaderView = GridColumnHeaderView.extend({
    initialize(options) {
        GridColumnHeaderView.prototype.initialize.apply(this, arguments);

        if (this.column.filterView) {
            this.filterView = this.column.filterView;
            this.listenTo(this.model, 'change:hasFilter', this.__resolveFilterClass, this);
        }
        this.gridEventAggregator = options.gridEventAggregator;
    },

    template: Handlebars.compile(template),

    ui: {
        cellContent: '.js-cell-content',
        filterBtn: '.js-filter-btn'
    },

    events: {
        'click @ui.cellContent': '__handleSorting',
        'click @ui.filterBtn': 'showFilterPopout'
    },

    __resolveFilterClass() {
        if (!this.column.filterView) {
            return;
        }

        const hasFilter = this.model.get('hasFilter');

        if (hasFilter) {
            this.$el.addClass('has-filter');
        } else {
            this.$el.removeClass('has-filter');
        }
    },

    showFilterPopout(event) {
        event.preventDefault();
        event.stopPropagation();
        this.gridEventAggregator.trigger('showFilterView', {
            columnHeader: this,
            filterView: this.filterView,
            position: $(event.currentTarget).offset()
        });
    },

    templateHelpers() {
        return {
            sortingAsc: this.column.sorting === 'asc',
            sortingDesc: this.column.sorting === 'desc',
            filterView: this.filterView !== undefined
        };
    },

    onRender() {
        this.__resolveFilterClass();
    }
});

export default ColumnHeaderView;
