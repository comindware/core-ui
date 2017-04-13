/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers } from 'utils';
import VirtualCollection from '../collections/VirtualCollection';
import ListView from './views/ListView';
import ScrollbarView from './views/ScrollbarView';
import EmptyListView from './views/EmptyListView';
import EmptyGridView from './views/EmptyGridView';
import EventAggregator from './EventAggregator';
import GridView from './views/GridView';
import GridColumnHeaderView from './views/GridColumnHeaderView';

let factory = {
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
        helpers.ensureOption(options, 'collection');
        helpers.ensureOption(options, 'listViewOptions');
        if (!options.listViewOptions.childView && !options.listViewOptions.childViewSelector) {
            helpers.throwError('The option `childView` or `childViewSelector` is required.', 'MissingOptionError');
        }
        helpers.ensureOption(options, 'listViewOptions.childHeight');

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
        helpers.ensureOption(options, 'collection');
        helpers.ensureOption(options, 'gridViewOptions.columns');
        helpers.ensureOption(options, 'gridViewOptions.childHeight');
        if (!options.gridViewOptions.useDefaultRowView) {
            helpers.ensureOption(options, 'gridViewOptions.childView');
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
                helpers.throwError('Invalid collection', 'ArgumentError');
            }
        }
        return collection;
    }
};
export default factory;
