import { helpers } from 'utils';
import VirtualCollection from '../collections/VirtualCollection';
import ListView from './views/ListView';
import EmptyListView from './views/EmptyListView';
import EmptyGridView from './views/EmptyGridView';
import EventAggregator from './EventAggregator';
import GridView from './views/GridView';
import GridColumnHeaderView from './views/GridColumnHeaderView';

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

        const collection = factory.createWrappedCollection(Object.assign({}, { collection: options.collection }, options.collectionOptions));

        const listViewOptions = _.extend(
            {
                collection,
                emptyView: EmptyListView
            },
            options.listViewOptions
        );
        const listView = new ListView(listViewOptions);

        const eventAggregator = new EventAggregator({
            views: [listView],
            collection
        });

        return {
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

        const collection = factory.createWrappedCollection(options);

        //noinspection JSUnresolvedVariable
        const gridViewOptions = _.extend(
            {
                gridColumnHeaderView: GridColumnHeaderView,
                collection,
                emptyView: EmptyGridView,
                emptyViewOptions: {
                    text: Localizer.get('CORE.GRID.EMPTYVIEW.EMPTY')
                }
            },
            options.gridViewOptions
        );
        const gridView = new GridView(gridViewOptions);

        const eventAggregator = new EventAggregator({
            views: [gridView],
            collection
        });

        return {
            gridView,
            collection,
            eventAggregator
        };
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
    createNativeGrid(options) {
        const collection = createWrappedCollection({
            collection: options.collection,
            childrenAttribute: options.gridViewOptions.childrenAttribute,
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
                rowViewSelector: options.rowViewSelector,
                emptyView: options.emptyView
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
    createWrappedCollection
};
export default factory;
