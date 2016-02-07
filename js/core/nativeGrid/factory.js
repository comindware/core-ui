/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers } from '../utils/utilsApi';
import NativeGridView from './views/NativeGridView';
import VirtualCollection from '../collections/VirtualCollection';

/**
 * @memberof module:core.nativeGrid.factory
 * @method createWrappedCollection
 * @description Метод для Backbone-коллекции элементов списка
 * @param {Object} options Constructor options
 * @param {Array} options.collection Массив элементов
 * @returns {Object}
 * @returns {Backbone.Collection} collection Коллекция элементов списка
 * */
let createWrappedCollection = function (collection, options) {
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
};

export default {
    /**
     * @memberof module:core.nativeGrid.factory
     * @method createDefaultList
     * @description Метод для создания списка
     * @param {Object} options Constructor options
     * @param {Backbone.View} [options.emptyView] View используемый по умолчанию для отображения пустого списка (нет строк)
     * @param {Object} options.gridViewOptions Опции списка
     * @param {Object} [options.gridViewOptions.selectableBehavior] Выбора элементов в списке (none/single/multi)
     * @param {Function} [options.onColumnSort] Обработчик oncColumnSort события
     * @param {Backbone.View} [options.rowView] View строки списка
     * @returns {Backbone.View} NativeGridView View-списка
     * */
    createNativeGrid: function (options) {
        var collection = createWrappedCollection(options.collection, {selectableBehavior: options.gridViewOptions.selectableBehavior});

        var gridViewOptions = _.extend({
            collection: collection,
            onColumnSort: options.onColumnSort,
            rowView: options.rowView,
            emptyView: options.emptyView
        }, options.gridViewOptions);

        return new NativeGridView(gridViewOptions);
    }
};
