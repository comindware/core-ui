/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, _, Handlebars, shared, classes */

/*
    Public interface:

    This view produce:
        trigger: positionChanged (sender, { oldPosition, position })
        trigger: viewportHeightChanged (sender, { oldViewportHeight, viewportHeight })
    This view react on:
        collection change (via Backbone.Collection events)
        position change (when we scroll with scrollbar for example): updatePosition(newPosition)
 */

define(['text!core/list/templates/grid.html',
        'module/lib',
        'core/utils/utilsApi',
        'core/list/views/ListView',
        'core/list/views/RowView',
        'core/list/views/GridHeaderView',
        'core/list/views/NoColumnsView',
        'core/list/views/LoadingRowView'],

    function (template, lib, utils, ListView, RowView, GridHeaderView, NoColumnsDefaultView, LoadingChildView) {
        'use strict';

        var constants = {
            gridRowHeight: 40,
            gridHeaderHeight: 51
        };

        /**
         * Some description for initializer
         * @name GridView
         * @memberof module:core.list.views
         * @class GridView
         * @constructor
         * @description View-контейнер для заголовка и контента
         * @extends Marionette.LayoutView
         * @param {Object} options Constructor options
         * @param {Array} options.columns массив колонок
         * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк)
         * @param {Number} options.childHeight высота строки списка (childView)
         * @param {Backbone.View} [options.childView] view строки списка
         * @param {Backbone.View} [options.childViewOptions] опции для childView
         * @param {Function} options.childViewSelector ?
         * @param {Object} [options.emptyViewOptions] опции для emptyView
         * @param {Backbone.View} options.gridColumnHeaderView View заголовка списка
         * @param {String} options.height задает как определяется высота строки, значения: fixed, auto
         * @param {Backbone.View} [options.loadingChildView] view-лоадер, показывается при подгрузке строк
         * @param {Backbone.View} options.noColumnsView View для отображения списка без колонок
         * @param {Object} [options.noColumnsViewOptions] опции для noColumnsView
         * @param {Number} options.maxRows максимальное количество отображаемых строк (используется с опцией height: auto)
         * @param {Boolean} options.useDefaultRowView использовать RowView по умолчанию. В случае, если true — обязательно должны быть указаны cellView для каждой колонки
         * */
        var GridView = Marionette.LayoutView.extend({
             initialize: function (options, testOption) {
                if (this.collection === undefined) {
                    throw 'You must provide a collection to display.';
                }

                if (options.columns === undefined) {
                    throw 'You must provide columns definition ("columns" option)';
                }

                options.onColumnSort && (this.onColumnSort = options.onColumnSort); //jshint ignore:line

                this.headerView = new GridHeaderView({
                    columns: options.columns,
                    gridEventAggregator: this,
                    gridColumnHeaderView: options.gridColumnHeaderView
                });

                this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);

                if (options.noColumnsView) {
                    this.noColumnsView = options.noColumnsView;
                } else {
                    this.noColumnsView = NoColumnsDefaultView;
                }
                options.noColumnsViewOptions && (this.noColumnsViewOptions = options.noColumnsViewOptions); // jshint ignore:line

                var childView = options.childView;
                if (options.useDefaultRowView) {
                    _.each(options.columns, function (column) {
                        if (column.cellView === undefined)
                            throw 'You must specify cellView for each column (useDefaultRowView flag is true)';
                    });

                    childView = RowView;
                    options.childHeight = constants.gridRowHeight;
                } else if (options.childHeight === undefined) {
                    throw 'You must provide a childHeight for the child item view (in pixels).';
                }

                var childViewOptions = _.extend(options.childViewOptions || {}, {
                    columns: options.columns,
                    gridEventAggregator: this
                });

                this.listView = new ListView({
                    collection: this.collection,
                    childView: childView,
                    childViewSelector: options.childViewSelector,
                    emptyView: options.emptyView,
                    emptyViewOptions: options.emptyViewOptions,
                    noColumnsView: options.noColumnsView,
                    noColumnsViewOptions: options.noColumnsViewOptions,
                    childHeight: options.childHeight,
                    childViewOptions: childViewOptions,
                    loadingChildView: options.loadingChildView || LoadingChildView,
                    maxRows: options.maxRows,
                    height: options.height
                });

                this.listenTo(this.listView, 'all', function (eventName, view, eventArguments) {
                    if (_.string.startsWith(eventName, 'childview')) {
                        this.trigger.apply(this, [eventName, view ].concat(eventArguments));
                    }
                }.bind(this));

                this.listenTo(this.listView, 'positionChanged', function (sender, args) {
                    this.trigger('positionChanged', this, args);
                }.bind(this));

                this.listenTo(this.listView, 'viewportHeightChanged', this.__updateHeight, this);

                this.updatePosition = this.listView.updatePosition.bind(this.listView);

                this.listenTo(this.collection, 'reset', function (collection, options) {
                    // fixing display:table style if there were not rows
                    if (options && options.previousModels.length === 0) {
                        this.listView.visibleCollectionRegion.currentView.$el.css('display', 'none');
                        // forcing browser to rebuild DOM accessing the attribute
                        this.listView.visibleCollectionRegion.currentView.$el.css('display');
                        this.listView.visibleCollectionRegion.currentView.$el.css('display', 'table');
                    }
                }.bind(this));
            },

            __updateHeight: function (sender, args) {
                args.gridHeight = args.listViewHeight + constants.gridHeaderHeight;
                this.$el.height(args.gridHeight);
                this.trigger('viewportHeightChanged', this, args);
            },

            onColumnSort: function (column, comparator) {
                this.collection.comparator = comparator;
                this.collection.sort();
            },

            regions: {
                headerRegion: '.grid-header-view',
                contentViewRegion: '.grid-content-view',
                noColumnsViewRegion: '.js-nocolumns-view-region'
            },

            className: 'grid',
            template: Handlebars.compile(template),

            onShow: function () {
                if (this.options.columns.length === 0) {
                    var noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
                    this.noColumnsViewRegion.show(noColumnsView);
                }
                this.headerRegion.show(this.headerView);
                this.contentViewRegion.show(this.listView);
            },

            onRender: function () {
                utils.htmlHelpers.forbidSelection(this.el);
            },

            sortBy: function (columnIndex, sorting) {
                var column = this.options.columns[columnIndex];
                if (sorting) {
                    _.each(this.options.columns, function (c) {
                        c.sorting = null;
                    });
                    column.sorting = sorting;
                    switch (sorting) {
                    case 'asc':
                        this.collection.comparator = column.sortAsc;
                        break;
                    case 'desc':
                        this.collection.comparator = column.sortDesc;
                        break;
                    }
                } else {
                    sorting = column.sorting;
                    _.each(this.options.columns, function (c)
                    {
                        c.sorting = null;
                    });
                    switch (sorting)
                    {
                    case 'asc':
                        column.sorting = 'desc';
                        this.collection.comparator = column.sortDesc;
                        break;
                    case 'desc':
                        column.sorting = 'asc';
                        this.collection.comparator = column.sortAsc;
                        break;
                    default:
                        column.sorting = 'asc';
                        this.collection.comparator = column.sortAsc;
                        break;
                    }
                }
                this.onColumnSort(column, this.collection.comparator);
                this.headerView.updateSorting();
            }
        });

        return GridView;
    });
