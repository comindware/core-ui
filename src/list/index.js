import EmptyListView from './views/EmptyListView';
import EmptyGridView from './views/EmptyGridView';
import GridColumnHeaderView from './views/GridColumnHeaderView';
import GridHeaderView from './views/GridHeaderView';
import GridView from './views/GridView';
import ListView from './views/CollectionView';
import RowView from './views/RowView';
import EditableGridFieldView from './views/EditableGridFieldView';
import ListItemViewBehavior from './views/behaviors/ListItemViewBehavior';
import GridItemViewBehavior from './views/behaviors/GridItemViewBehavior';
import LoadingRowModel from './models/LoadingRowModel';
import ListGroupBehavior from './models/behaviors/ListGroupBehavior';
import ListItemBehavior from './models/behaviors/ListItemBehavior';
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
        GridColumnHeaderView,
        GridHeaderView,
        GridView,
        ListView,
        RowView,
        EditableGridFieldView,

        behaviors: {
            ListItemViewBehavior,
            GridItemViewBehavior
        }
    },
    /**
     * Backbone-модели списка
     * @namespace
     * */
    models: {
        LoadingRowModel,
        behaviors: {
            ListGroupBehavior,
            ListItemBehavior
        }
    },

    meta
};
