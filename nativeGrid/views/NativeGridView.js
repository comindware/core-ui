/**
 * Developer: Grigory Kuznetsov
 * Date: 14.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib',
        'text!../templates/nativeGrid.html',
        './ListView',
        './RowView',
        './HeaderView',
        './ColumnHeaderView',
        './NoColumnsView',
        '../../models/behaviors/SelectableBehavior'
    ],
    function (lib, template, ListView, RowView, HeaderView, ColumnHeaderView, NoColumnsDefaultView, SelectableBehavior) {
        'use strict';

        var NativeGridView = Marionette.LayoutView.extend({
            template: Handlebars.compile(template),

            regions: {
                headerRegion: '.js-native-grid-header-region',
                listRegion: '.js-native-grid-list-region',
                noColumnsViewRegion: '.js-nocolumns-view-region'
            },

            className: 'dev-native-grid',

            initialize: function (options) {
                this.collection = options.collection;
                _.extend(this.collection, new SelectableBehavior.MultiSelect(this));
                this.columsFit = options.columsFit;

                this.initializeViews();
            },

            initializeViews: function () {
                this.headerView = new HeaderView({
                    columns: this.options.columns,
                    columnHeaderView: ColumnHeaderView,
                    gridEventAggregator: this,
                    columnsFit: this.options.columnsFit
                });

                if (this.options.noColumnsView) {
                    this.noColumnsView = this.options.noColumnsView;
                } else {
                    this.noColumnsView = NoColumnsDefaultView;
                }
                this.options.noColumnsViewOptions && (this.noColumnsViewOptions = this.options.noColumnsViewOptions); // jshint ignore:line

                var childViewOptions = _.extend(this.options.gridViewOptions || {}, {
                    columns: this.options.columns,
                    gridEventAggregator: this,
                    columnsFit: this.options.columnsFit
                });

                this.listView = new ListView({
                    childView: RowView,
                    childHeight: 41,
                    collection: this.collection,
                    childViewOptions: childViewOptions,
                    height: 'auto',
                    maxRows: 1000,
                    gridEventAggregator: this
                });

                this.listenTo(this, 'listResized', this.__onListResized, this);
                this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
            },

            __onListResized: function (fullWidth) {
                this.listRegion.$el.width(fullWidth);
                this.$el.width(fullWidth);
            },

            onShow: function () {
                if (this.options.columns.length === 0) {
                    var noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
                    this.noColumnsViewRegion.show(noColumnsView);
                }
                this.headerRegion.show(this.headerView);
                this.listRegion.show(this.listView);
            },

            onColumnSort: function (column, comparator) {
                this.collection.comparator = comparator;
                this.collection.sort();
            }
        });

        return NativeGridView;
    });
