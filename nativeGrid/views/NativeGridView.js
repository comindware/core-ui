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
        'core/nativeGrid/views/RowView',
        './HeaderView',
        './ColumnHeaderView',
        '../../list/views/NoColumnsView',
        '../../models/behaviors/SelectableBehavior',
         '../../dropdown/factory',
         '../../dropdown/dropdownApi'
    ],
    function (lib, template, ListView, RowView, HeaderView, ColumnHeaderView, NoColumnsDefaultView, SelectableBehavior, dropdownFactory, dropdownApi) {
        'use strict';

        var NativeGridView = Marionette.LayoutView.extend({
            template: Handlebars.compile(template),

            regions: {
                headerRegion: '.js-native-grid-header-region',
                listRegion: '.js-native-grid-list-region',
                noColumnsViewRegion: '.js-nocolumns-view-region',
                popoutRegion: '.js-popout-region'
            },

            className: 'dev-native-grid',

            initialize: function (options) {
                this.collection = options.collection;
                _.extend(this.collection, new SelectableBehavior.MultiSelect(this));
                this.columsFit = options.columsFit;

                this.initializeViews();
                this.$document = $(document);
            },

            initializeViews: function () {
                this.headerView = new HeaderView({
                    columns: this.options.columns,
                    gridColumnHeaderView: ColumnHeaderView,
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
                    maxRows: 1000
                });

                this.listenTo(this, 'afterColumnsResize', this.__afterColumnsResize, this);
                this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
                this.listenTo(this, 'showFilterView', this.showFilterPopout, this);
            },

            __afterColumnsResize: function (width) {
                this.listView.setWidth(width);
            },

            onShow: function () {
                if (this.options.columns.length === 0) {
                    var noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
                    this.noColumnsViewRegion.show(noColumnsView);
                }
                this.headerRegion.show(this.headerView);
                this.listRegion.show(this.listView);
                this.bindListRegionScroll();
            },

            bindListRegionScroll: function () {
                this.listRegion.$el.scroll(function (event) {
                    this.headerRegion.$el.scrollLeft(event.currentTarget.scrollLeft);
                }.bind(this));
            },

            onColumnSort: function (column, comparator) {
                this.collection.comparator = comparator;
                this.collection.sort();
            },

            showFilterPopout: function (options) {
                var AnchoredButtonView = Marionette.ItemView.extend({
                    template: Handlebars.compile('<span class="js-anchor"></span>'),
                    behaviors: {
                        CustomAnchorBehavior: {
                            behaviorClass: dropdownApi.views.behaviors.CustomAnchorBehavior,
                            anchor: '.js-anchor'
                        }
                    },
                    tagName: 'div'
                });

                var filterViewOptions = this.options.columns.find(function (c) {
                    return c.id === options.columnHeader.options.column.id;
                }).filterViewOptions;

                this.filterDropdown = dropdownFactory.createPopout({
                    buttonView: AnchoredButtonView,
                    panelView: options.filterView,
                    panelViewOptions: filterViewOptions,
                    customAnchor: true
                });

                this.listenTo(this.filterDropdown, 'close', this.__onFilterClose, this);

                this.popoutRegion.show(this.filterDropdown);
                this.filterDropdown.$el.offset(options.position);
                this.filterDropdown.open();
            },

            __onFilterClose: function (child) {
                this.trigger('filterClose', child.panelView.model);
            }
        });

        return NativeGridView;
    });
