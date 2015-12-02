/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'core/utils/utilsApi',
        'core/collections/VirtualCollection',
        './views/ListView', './views/ScrollbarView', './views/EmptyListView', './views/EmptyGridView', './EventAggregator', './views/GridView', './views/GridColumnHeaderView'
    ],
    function (
        utils,
        VirtualCollection,
        ListView, ScrollbarView, EmptyListView, EmptyGridView, EventAggregator, GridView, GridColumnHeaderView
    ) {
        'use strict';

        var factory = {
            /**
             * @memberof module:core.list.factory
             * @method createDefaultList
             * @description Метод для создания списка
             * @param {Object} options Constructor options
             * @param {Array} options.collection Массив элементов списка
             * @param {Object} options.collectionOptions Опции коллекции
             * @param {Object} options.listViewOptions Опции списка
             * @param {Backbone.View} options.listViewOptions.childView View элемента списка
             * @returns {Object}
             * @returns {Backbone.View} scrollbarView Скроллбар
             * @returns {Backbone.View} gridView View-списка
             * @returns {Backbone.Collection} collection Коллекция элементов списка
             * @returns eventAggregator
             * */
            createDefaultList: function (options) {
                utils.helpers.ensureOption(options, 'collection');
                utils.helpers.ensureOption(options, 'listViewOptions');
                if (!options.listViewOptions.childView && !options.listViewOptions.childViewSelector) {
                    utils.helpers.throwError('The option `childView` or `childViewSelector` is required.', 'MissingOptionError');
                }
                utils.helpers.ensureOption(options, 'listViewOptions.childHeight');

                var collection = factory.createWrappedCollection(options.collection, options.collectionOptions);

                var scrollbarView = new ScrollbarView({
                    collection: collection
                });

                var listViewOptions = _.extend({
                    collection: collection,
                    emptyView: EmptyListView
                }, options.listViewOptions);
                var listView = new ListView(listViewOptions);

                var eventAggregator = new EventAggregator({
                    views: [ scrollbarView, listView ],
                    collection: collection
                });

                return {
                    scrollbarView: scrollbarView,
                    listView: listView,
                    collection: collection,
                    eventAggregator: eventAggregator
                };
            },

            /**
             * @memberof module:core.list.factory
             * @method createDefaultGrid
             * @description Метод для создания grid'а
             * @param {Object} options Constructor options
             * @param {number} options.childHeight Высота строки
             * @param {Backbone.View} options.childView View-строки списка
             * @param {Array} options.collection Массив элементов списка
             * @param {Object} options.collectionOptions Опции коллекции
             * @param {Object} options.gridViewOptions Опции списка
             * @param {Object} options.gridViewOptions.columns Колонки списка
             * @returns {Object}
             * @returns {Backbone.View} scrollbarView Скроллбар
             * @returns {Backbone.View} gridView View-списка
             * @returns {Backbone.Collection} collection Коллекция элементов списка
             * @returns eventAggregator
             * */
            createDefaultGrid: function (options) {
                utils.helpers.ensureOption(options, 'collection');
                utils.helpers.ensureOption(options, 'gridViewOptions.columns');
                utils.helpers.ensureOption(options, 'gridViewOptions.childHeight');
                if (!options.gridViewOptions.useDefaultRowView) {
                    utils.helpers.ensureOption(options, 'gridViewOptions.childView');
                }

                var collection = factory.createWrappedCollection(options.collection);

                //noinspection JSUnresolvedVariable
                var gridViewOptions = _.extend({
                    gridColumnHeaderView: GridColumnHeaderView,
                    collection: collection,
                    emptyView: EmptyGridView,
                    emptyViewOptions: {
                        text: Localizer.get('CORE.GRID.EMPTYVIEW.EMPTY')
                    }
                }, options.gridViewOptions);
                var gridView = new GridView(gridViewOptions);

                var scrollbarView = new ScrollbarView({
                    collection: collection
                });

                var eventAggregator = new EventAggregator({
                    views: [ scrollbarView, gridView ],
                    collection: collection
                });

                return {
                    scrollbarView: scrollbarView,
                    gridView: gridView,
                    collection: collection,
                    eventAggregator: eventAggregator
                };
            },

            /**
             * @memberof module:core.list.factory
             * @method createWrappedCollection
             * @description Метод для Backbone-коллекции элементов списка
             * @param {Object} options Constructor options
             * @param {Array} options.collection Массив элементов
             * @returns {Object}
             * @returns {Backbone.Collection} collection Коллекция элементов списка
             * */
            createWrappedCollection: function (collection, options) {
                if (!(collection instanceof VirtualCollection)) {
                    if (_.isArray(collection)) {
                        collection = new VirtualCollection(new Backbone.Collection(collection), options);
                    } else if (collection instanceof Backbone.Collection) {
                        collection = new VirtualCollection(collection, options);
                    } else {
                        utils.helpers.throwError('Invalid collection', 'ArgumentError');
                    }
                }
                return collection;
            }
        };
        return factory;
    });
