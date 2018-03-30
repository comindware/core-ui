/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { helpers } from 'utils';
import NativeGridView from '../list/views/GridView';
// import NativeGridView from './views/NativeGridView';
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
const createWrappedCollection = (collection, options) => {
    if (!(collection instanceof VirtualCollection)) {
        if (Array.isArray(collection)) {
            return new VirtualCollection(new Backbone.Collection(collection), options);
        } else if (collection instanceof Backbone.Collection) {
            return new VirtualCollection(collection, options);
        }
        helpers.throwError('Invalid collection', 'ArgumentError');
    }
    return collection;
};

const createTree = options => {
    const collection = options.collection;
    const childrenAttribute = options.childrenAttribute;
    if (!childrenAttribute) {
        return collection;
    }
    const resultCollection = new Backbone.Collection();
    const createTreeNodes = (sourceCollection, targetCollection, parentModel = null) => {
        sourceCollection.forEach(item => {
            let children;
            let attributes;
            if (Array.isArray(sourceCollection)) {
                children = item[childrenAttribute];
                attributes = item;
            } else if (sourceCollection instanceof Backbone.Collection) {
                children = item.get(childrenAttribute);
                attributes = item.attributes;
            } else {
                helpers.throwError('Invalid collection', 'ArgumentError');
            }
            const treeLeaf = new Backbone.Model(attributes);
            treeLeaf.parentModel = parentModel;
            treeLeaf.collapsed = !options.expandOnShow;
            treeLeaf.children = new Backbone.Collection();
            targetCollection.add(treeLeaf);
            if (children && children.length) {
                createTreeNodes(children, treeLeaf.children, treeLeaf);
            }
        });
    };
    createTreeNodes(collection, resultCollection);
    return resultCollection;
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
     * @param {Backbone.View} [options.headerView] View, используемый для отображения заголовка списка
     * @param {Backbone.View} [options.rowView] View строки списка
     * @param {Function} [options.rowViewSelector] Функция для разрешения (resolve) View, используемого для отображения строки списка
     * @returns {Backbone.View} NativeGridView View-списка
     * */
    createNativeGrid(options) {
        const collection = createWrappedCollection(options.collection, {
            selectableBehavior: options.gridViewOptions.selectableBehavior,
            isTree: options.gridViewOptions.isTree,
            expandOnShow: options.gridViewOptions.expandOnShow
        });

        const gridViewOptions = Object.assign(
            {
                collection,
                onColumnSort: options.onColumnSort,
                headerView: options.headerView,
                rowView: options.rowView,
                treeRowView: options.treeRowView,
                rowViewSelector: options.rowViewSelector,
                emptyView: options.emptyView
            },
            options.gridViewOptions
        );

        return new NativeGridView(gridViewOptions);
    },

    createTreeGrid(options) {
        options.collection = createTree(options);
        if (!options.gridViewOptions) {
            options.gridViewOptions = {};
        }
        options.gridViewOptions.isTree = true;
        return this.createNativeGrid(options);
    },

    createTree
};
