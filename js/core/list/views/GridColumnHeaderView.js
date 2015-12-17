/**
 * Developer: Stepan Burguchev
 * Date: 8/22/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Marionette, Handlebars */

define(['text!core/list/templates/gridcolumnheader.html', 'core/libApi'],
    function (template) {
        'use strict';

        /**
         * Some description for initializer
         * @name GridColumnHeaderView
         * @memberof module:core.list.views
         * @class GridColumnHeaderView
         * @constructor
         * @description View используемый по умолчанию для отображения ячейки заголовка (шапки) списка, передавать в {@link module:core.list.views.GridView GridView options.gridColumnHeaderView}
         * @extends Marionette.ItemView
         * @param {Object} options Constructor options
         * @param {Array} options.columns массив колонок
         * */
        var GridColumnHeaderView = Marionette.ItemView.extend({
            initialize: function (options) {
                this.column = options.column;
            },

            template: Handlebars.compile(template),
            className: 'grid-header-column-content',

            events: {
                'click': '__handleSorting'
            },

            __handleSorting: function ()
            {
                this.trigger('columnSort', this, {
                    column: this.column
                });
            },

            templateHelpers: function () {
                return {
                    sortingAsc: this.column.sorting === 'asc',
                    sortingDesc: this.column.sorting === 'desc'
                };
            }
        });

        return GridColumnHeaderView;
    });
