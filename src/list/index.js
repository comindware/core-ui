/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';
import EventAggregator from './EventAggregator';
import EmptyListView from './views/EmptyListView';
import EmptyGridView from './views/EmptyGridView';
import GridColumnHeaderView from './views/GridColumnHeaderView';
import GridHeaderView from './views/GridHeaderView';
import GridView from './views/GridView';
import ListView from './views/ListView';
import RowView from './views/RowView';
import ScrollbarView from './views/ScrollbarView';
import ListGroupViewBehavior from './views/behaviors/ListGroupViewBehavior';
import ListItemViewBehavior from './views/behaviors/ListItemViewBehavior';
import GridItemViewBehavior from './views/behaviors/GridItemViewBehavior';
import LoadingRowModel from './models/LoadingRowModel';
import ListGroupBehavior from './models/behaviors/ListGroupBehavior';
import ListItemBehavior from './models/behaviors/ListItemBehavior';
import GridItemBehavior from './models/behaviors/GridItemBehavior';
import factory from './factory';
import cellFactory from './CellViewFactory';

export default /** @lends module:core.list */ {
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
        ScrollbarView,

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
