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

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        'core/utils/utilsApi',
        './views/NativeGridView',
        'core/collections/VirtualCollection'
    ],
    function (
        utils, NativeGridView, VirtualCollection

    ) {
        'use strict';

        /**
         * @memberof module:core.nativeGrid.factory
         * @method createWrappedCollection
         * @description Метод для Backbone-коллекции элементов списка
         * @param {Object} options Constructor options
         * @param {Array} options.collection Массив элементов
         * @returns {Object}
         * @returns {Backbone.Collection} collection Коллекция элементов списка
         * */
        var createWrappedCollection = function (collection, options) {
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
        };

        return {
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

    }
);