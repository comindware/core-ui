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

define(['text!../templates/columnHeader.html', 'module/lib', '../FilterViewFactory'],
    function (template, lib, FilterViewFactory) {
        'use strict';


        var ColumnHeaderView = Marionette.LayoutView.extend({
            initialize: function (options) {
                this.column = options.column;
                this.column.filterView && (this.filterView = this.column.filterView); //jshint ignore:line

                this.$document = $(document);
            },

            template: Handlebars.compile(template),
            className: 'grid-header-column-content',

            regions: {
                filterPopoutRegion: '.js-filter-popout-region'
            },

            ui: {
                cellContent: '.js-cell-content',
                filterBtn: '.js-filter-btn'
            },

            events: {
                'click @ui.cellContent': '__handleSorting',
                'click @ui.filterBtn': 'showFilterPopout'
            },

            __handleSorting: function (e)
            {
                this.trigger('columnSort', this, {
                    column: this.column
                });
            },

            showFilterPopout: function(event) {
                if (this.isPopupVisible)
                    return;

                var FilterView = FilterViewFactory.getFilterViewByType();
                this.filterView = new FilterView();
                this.filterPopoutRegion.show(this.filterView);

                setTimeout(function () {
                    this.$document.on('mousedown', this.handleClick.bind(this));
                    this.isPopupVisible = true;
                }.bind(this));
            },

            handleClick: function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (this.isPopupVisible && !$(event.target).closest('.' + this.filterView.className).length) {
                    this.closeFilterPopout();
                }
            },

            closeFilterPopout: function () {
                this.$document.off('mousedown');
                this.isPopupVisible = false;
                this.filterPopoutRegion.reset();
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
