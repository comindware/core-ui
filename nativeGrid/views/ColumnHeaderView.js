/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, Handlebars */

define(['text!../templates/columnHeader.html', 'module/lib', '../../list/views/GridColumnHeaderView'],
    function (template, lib, GridColumnHeaderView) {
        'use strict';

        var ColumnHeaderView = GridColumnHeaderView.extend({
            initialize: function (options) {
                GridColumnHeaderView.prototype.initialize.apply(this, arguments);

                this.id = options.column.id;
                this.column.filterView && (this.filterView = this.column.filterView); //jshint ignore:line
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

            showFilterPopout: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.gridEventAggregator.trigger('showFilterView', {
                    columnHeader: this,
                    filterView: this.filterView,
                    position: $(event.currentTarget).offset()
                });
            },

            templateHelpers: function () {
                return {
                    sortingAsc: this.column.sorting === 'asc',
                    sortingDesc: this.column.sorting === 'desc',
                    filterView: this.filterView !== undefined
                };
            }
        });

        return ColumnHeaderView;
    });
