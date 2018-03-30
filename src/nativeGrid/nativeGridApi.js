import factory from './factory';
import filterViewFactory from './filterViewFactory';
import RowView from '../list/views/RowView';
import HeaderView from '../list/views/GridHeaderView';
import ColumnHeaderView from '../list/views/GridColumnHeaderView';
import NativeGridView from '../list/views/GridView';

export default {
    /**
     * Фабрика списков
     * @namespace
     * */
    factory,
    /**
     * Фабрика фильтров
     * @namespace
     * */
    filterViewFactory,
    /**
     * Views-списка
     * @namespace
     * */
    views: {
        RowView,
        HeaderView,
        ColumnHeaderView,
        NativeGridView
    }
};
