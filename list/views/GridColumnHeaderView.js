/**
 * Developer: Stepan Burguchev
 * Date: 8/22/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, Handlebars */

define(['text!shared/list/templates/gridcolumnheader.html', 'module/utils'],
    function (template) {
        'use strict';
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

        var ns = window.ClassLoader.createNS("shared.list.views");
        ns.GridColumnHeaderView = GridColumnHeaderView;

        return GridColumnHeaderView;
    });
