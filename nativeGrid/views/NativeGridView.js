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
                this.rowView = options.rowView || RowView;
                this.collection = options.collection;
                this.columsFit = options.columsFit;
                options.onColumnSort && (this.onColumnSort = options.onColumnSort); //jshint ignore:line

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
                    childView: this.rowView,
                    childHeight: 41,
                    collection: this.collection,
                    childViewOptions: childViewOptions,
                    height: 'auto',
                    maxRows: 1000
                });

                this.listenTo(this, 'afterColumnsResize', this.__afterColumnsResize, this);
                this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
                this.listenTo(this, 'showFilterView', this.showFilterPopout, this);
                this.listenTo(this.listView, 'all', function (eventName, view, eventArguments) {
                    if (_.string.startsWith(eventName, 'childview')) {
                        this.trigger.apply(this, [eventName, view ].concat(eventArguments));
                    }
                }.bind(this));
            },

            __onRowClick: function (model) {
                this.trigger('row:click', model);
            },

            __onRowDblClick: function (model) {
                this.trigger('row:dblclick', model);
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

                this.listenTo(this.filterDropdown, 'all', function (eventName, eventArguments) {
                    if (_.string.startsWith(eventName, 'panel:')) {
                        this.trigger.apply(this, ['column:filter:' + eventName.slice(6), options.columnHeader.options.column.id, this.filterDropdown.panelView ].concat(eventArguments));
                    }
                }.bind(this));

                this.listenTo(this.filterDropdown, 'close', function (child) {
                    this.trigger('column:filter:close', options.columnHeader.options.column.id, child.panelView);
                }.bind(this));

                this.popoutRegion.show(this.filterDropdown);
                this.filterDropdown.$el.offset(options.position);
                this.filterDropdown.open();
            }
        });

        return NativeGridView;
    });
