
import 'lib';
import factory from './factory';
import filterViewFactory from './filterViewFactory';
import RowView from './views/RowView';
import TreeRowView from './views/TreeRowView';
import HeaderView from './views/HeaderView';
import ColumnHeaderView from './views/ColumnHeaderView';
import NativeGridView from './views/NativeGridView';

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
        TreeRowView,
        HeaderView,
        ColumnHeaderView,
        NativeGridView
    }
};
