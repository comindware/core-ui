import EventAggregator from './EventAggregator';
import EmptyListView from './views/EmptyListView';
import EmptyGridView from './views/EmptyGridView';
import GridColumnHeaderView from './views/GridColumnHeaderView';
import GridHeaderView from './views/GridHeaderView';
import GridView from './views/GridView';
import ListView from './views/ListView';
import RowView from './views/RowView';
import ListGroupViewBehavior from './views/behaviors/ListGroupViewBehavior';
import ListItemViewBehavior from './views/behaviors/ListItemViewBehavior';
import GridItemViewBehavior from './views/behaviors/GridItemViewBehavior';
import LoadingRowModel from './models/LoadingRowModel';
import ListGroupBehavior from './models/behaviors/ListGroupBehavior';
import ListItemBehavior from './models/behaviors/ListItemBehavior';
import GridItemBehavior from './models/behaviors/GridItemBehavior';
import factory from './factory';
import cellFactory from './CellViewFactory';
import EditableGridFieldView from './views/EditableGridFieldView';
import GridController from './controllers/GridController';

export default /** @lends module:core.list */ {
    controllers: {
        GridController
    },

    EventAggregator,
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
            ListGroupViewBehavior,
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
            ListItemBehavior,
            GridItemBehavior
        }
    }
};
