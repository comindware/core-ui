import EmptyListView from './views/EmptyListView';
import EmptyGridView from './views/EmptyGridView';
import GridHeaderView from './views/header/GridHeaderView';
import GridView from './views/GridView';
import ListView from './views/CollectionView';
import RowView from './views/RowView';
import EditableGridFieldView from './views/EditableGridFieldView';
import ListItemViewBehavior from './behaviors/ListItemViewBehavior';
import factory from './factory';
import cellFactory from './CellViewFactory';
import GridController from './controllers/GridController';
import meta from './meta';

export default {
    controllers: {
        GridController
    },

    /**
     * Фабрика списков
     * @namespace
     * */
    factory,
    /**
     * Фабрика ячеек
     * @namespace
     * */
    cellFactory,
    /**
     * Views-списка
     * @namespace
     * */
    views: {
        EmptyListView,
        EmptyGridView,
        GridHeaderView,
        GridView,
        ListView,
        RowView,
        EditableGridFieldView,

        behaviors: {
            ListItemViewBehavior
        }
    },
    meta
};
