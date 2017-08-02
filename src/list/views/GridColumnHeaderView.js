/**
 * Developer: Stepan Burguchev
 * Date: 8/22/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/gridcolumnheader.hbs';

/**
 * @name GridColumnHeaderView
 * @memberof module:core.list.views
 * @class GridColumnHeaderView
 * @constructor
 * @description View используемый по умолчанию для отображения ячейки заголовка (шапки) списка, передавать в
 * {@link module:core.list.views.GridView GridView options.gridColumnHeaderView}
 * @extends Marionette.ItemView
 * @param {Object} options Constructor options
 * @param {Array} options.columns массив колонок
 * */
const GridColumnHeaderView = Marionette.ItemView.extend({
    initialize(options) {
        this.column = options.column;
    },

    template: Handlebars.compile(template),
    className: 'grid-header-column-content',

    events: {
        click: '__handleSorting'
    },

    __handleSorting() {
        this.trigger('columnSort', this, {
            column: this.column
        });
    },

    templateHelpers() {
        return {
            sortingAsc: this.column.sorting === 'asc',
            sortingDesc: this.column.sorting === 'desc'
        };
    }
});

export default GridColumnHeaderView;
