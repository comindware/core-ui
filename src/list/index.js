import EmptyGridView from './views/EmptyGridView';
import GridHeaderView from './views/header/GridHeaderView';
import GridView from './views/GridView';
import RowView from './views/RowView';
import ListItemViewBehavior from './behaviors/ListItemViewBehavior';
import factory from './factory';
import cellFactory from './CellViewFactory';
import meta from './meta';

export default {
    GridView,

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
        EmptyGridView,
        GridHeaderView,
        GridView,
        RowView,

        behaviors: {
            ListItemViewBehavior
        }
    },
    meta
};
