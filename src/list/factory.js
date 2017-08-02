/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { helpers } from 'utils';
import VirtualCollection from '../collections/VirtualCollection';
import ListView from './views/ListView';
import ScrollbarView from './views/ScrollbarView';
import EmptyListView from './views/EmptyListView';
import EmptyGridView from './views/EmptyGridView';
import EventAggregator from './EventAggregator';
import GridView from './views/GridView';
import GridColumnHeaderView from './views/GridColumnHeaderView';

const factory = {
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
    createDefaultList(options) {
        helpers.ensureOption(options, 'collection');
        helpers.ensureOption(options, 'listViewOptions');
        if (!options.listViewOptions.childView && !options.listViewOptions.childViewSelector) {
            helpers.throwError('The option `childView` or `childViewSelector` is required.', 'MissingOptionError');
        }
        helpers.ensureOption(options, 'listViewOptions.childHeight');

        const collection = factory.createWrappedCollection(options.collection, options.collectionOptions);

        const scrollbarView = new ScrollbarView({
            collection
        });

        const listViewOptions = _.extend({
            collection,
            emptyView: EmptyListView
        }, options.listViewOptions);
        const listView = new ListView(listViewOptions);

        const eventAggregator = new EventAggregator({
            views: [ scrollbarView, listView ],
            collection
        });

        return {
            scrollbarView,
            listView,
            collection,
            eventAggregator
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
    createDefaultGrid(options) {
        helpers.ensureOption(options, 'collection');
        helpers.ensureOption(options, 'gridViewOptions.columns');
        helpers.ensureOption(options, 'gridViewOptions.childHeight');
        if (!options.gridViewOptions.useDefaultRowView) {
            helpers.ensureOption(options, 'gridViewOptions.childView');
        }

        const collection = factory.createWrappedCollection(options.collection);

        //noinspection JSUnresolvedVariable
        const gridViewOptions = _.extend({
            gridColumnHeaderView: GridColumnHeaderView,
            collection,
            emptyView: EmptyGridView,
            emptyViewOptions: {
                text: Localizer.get('CORE.GRID.EMPTYVIEW.EMPTY')
            }
        }, options.gridViewOptions);
        const gridView = new GridView(gridViewOptions);

        const scrollbarView = new ScrollbarView({
            collection
        });

        const eventAggregator = new EventAggregator({
            views: [ scrollbarView, gridView ],
            collection
        });

        return {
            scrollbarView,
            gridView,
            collection,
            eventAggregator
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
    createWrappedCollection(collection, options) {
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
