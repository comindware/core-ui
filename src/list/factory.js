import { comparators, helpers } from 'utils';
import VirtualCollection from '../collections/VirtualCollection';
import ListView from './views/CollectionView';
import EmptyGridView from './views/EmptyGridView';
import GridView from './views/GridView';

export const getDefaultComparator = (columns = []) => {
    const sortingColumn = columns.find(column => column.sorting);
    let comparator;
    if (sortingColumn) {
        comparator = sortingColumn.sorting === 'asc' ? sortingColumn.sortAsc : sortingColumn.sortDesc;
        if (!comparator) {
            comparator = helpers.comparatorFor(comparators.getComparatorByDataType(sortingColumn.dataType || sortingColumn.type, sortingColumn.sorting), sortingColumn.key);
        }
    }
    return comparator;
};

export const createWrappedCollection = options => {
    const collection = options.collection;
    const childrenAttribute = options.childrenAttribute;
    const processCollection = (sourceCollection, parentModel = null) => {
        sourceCollection.forEach(item => {
            let children;
            if (childrenAttribute) {
                children = item.get(childrenAttribute);
                if (Array.isArray(children)) {
                    children = new Backbone.Collection(children);
                }
                if (children && children.length) {
                    item.children = children;
                    processCollection(children, item);
                }
            }
            item.parentModel = parentModel;
            item.collapsed = !options.expandOnShow;
        });
    };
    if (!(collection instanceof VirtualCollection)) {
        if (!collection || Array.isArray(collection)) {
            const adjustedCollection = new Backbone.Collection(collection);
            processCollection(adjustedCollection);
            return new VirtualCollection(adjustedCollection, options);
        } else if (collection instanceof Backbone.Collection) {
            processCollection(collection);
            return new VirtualCollection(collection, options);
        }
    }
    return collection;
};

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
     * @returns {Backbone.View} listView View-списка
     * */
    createDefaultList(options) {
        helpers.ensureOption(options, 'collection');
        helpers.ensureOption(options, 'listViewOptions');
        if (!options.listViewOptions.childView && !options.listViewOptions.childViewSelector) {
            helpers.throwError('The option `childView` or `childViewSelector` is required.', 'MissingOptionError');
        }
        helpers.ensureOption(options, 'listViewOptions.childHeight');

        const collection = factory.createWrappedCollection(
            Object.assign(
                {},
                {
                    collection: options.collection,
                    isSliding: true
                },
                options.collectionOptions
            )
        );

        const listViewOptions = _.extend(
            {
                collection,
                emptyView: EmptyGridView
            },
            options.listViewOptions
        );

        return new ListView(listViewOptions);
    },

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
    createDefaultGrid(options) {
        const collection = createWrappedCollection({
            collection: options.collection,
            childrenAttribute: options.gridViewOptions.childrenAttribute,
            selectableBehavior: options.gridViewOptions.selectableBehavior,
            isTree: options.gridViewOptions.isTree,
            expandOnShow: options.gridViewOptions.expandOnShow,
            isSliding: options.isSliding === false ? options.isSliding : true,
            comparator: getDefaultComparator(options.columns || options.gridViewOptions.columns || [])
        });

        const gridViewOptions = Object.assign(
            {
                collection,
                onColumnSort: options.onColumnSort,
                headerView: options.headerView,
                childView: options.childView,
                childViewSelector: options.childViewSelector
            },
            options.gridViewOptions
        );

        return new GridView(gridViewOptions);
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
    createWrappedCollection,

    getDefaultComparator
};
export default factory;
