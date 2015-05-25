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

define(['text!core/list/templates/grid.html', 'module/lib', 'core/utils/utilsApi', 'core/list/views/ListView', 'core/list/views/GridHeaderView'],
    function (template, lib, utils) {
        'use strict';

        var GridView = Marionette.LayoutView.extend({
            initialize: function (options) {
                if (this.collection === undefined) {
                    throw 'You must provide a collection to display.';
                }
                if (options.childHeight === undefined) {
                    throw 'You must provide a childHeight for the child item view (in pixels).';
                }
                if (options.columns === undefined) {
                    throw 'You must provide columns definition ("columns" option)';
                }

                this.headerView = new classes.shared.list.views.GridHeaderView({
                    collection: this.collection,
                    columns: options.columns,
                    gridEventAggregator: this,
                    gridColumnHeaderView: options.gridColumnHeaderView
                });

                var childViewOptions = _.extend(options.childViewOptions || {}, {
                    columns: options.columns,
                    gridEventAggregator: this
                });
                this.listView = new classes.shared.list.views.ListView({
                    collection: this.collection,
                    childView: options.childView,
                    childViewSelector: options.childViewSelector,
                    emptyView: options.emptyView,
                    emptyViewOptions: options.emptyViewOptions,
                    childHeight: options.childHeight,
                    childViewOptions: childViewOptions
                });
                this.listenTo(this.listView, 'positionChanged', function (sender, args) {
                    this.trigger('positionChanged', this, args);
                }.bind(this));
                this.listenTo(this.listView, 'viewportHeightChanged', function (sender, args) {
                    this.trigger('viewportHeightChanged', this, args);
                }.bind(this));
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

            regions: {
                headerRegion: '.grid-header-view',
                contentViewRegion: '.grid-content-view'
            },

            events: {
            },
            
            className: 'grid',
            template: Handlebars.compile(template),
  
            onShow: function ()
            {
                this.contentViewRegion.show(this.listView);
                this.headerRegion.show(this.headerView);
            },
            
            onRender: function () {
                utils.htmlHelpers.forbidSelection(this.el);
            },

            sortBy: function (columnIndex, sorting) {
                var column = this.options.columns[columnIndex];
                if (sorting) {
                    _.each(this.options.columns, function (c)
                    {
                        c.sorting = null;
                    });
                    column.sorting = sorting;
                    switch (sorting)
                    {
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
                this.collection.sort();
                this.headerView.updateSorting();
            }
        });

        var ns = window.ClassLoader.createNS("shared.list.views");
        ns.GridView = GridView;

        return GridView;
    });
