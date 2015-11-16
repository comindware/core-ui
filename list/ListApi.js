/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, _, console */

define(['./EventAggregator',
        './views/EmptyListView',
        './views/EmptyGridView',
        './views/GridColumnHeaderView',
        './views/GridHeaderView',
        './views/GridView',
        './views/ListView',
        './views/RowView',
        './views/ScrollbarView',
        './views/behaviors/ListGroupViewBehavior',
        './views/behaviors/ListItemViewBehavior',
        './views/behaviors/GridItemViewBehavior',
        './models/LoadingRowModel',
        './models/behaviors/ListGroupBehavior',
        './models/behaviors/ListItemBehavior',
        './models/behaviors/GridItemBehavior',

        './factory',
        './CellViewFactory',
        'module/lib'
    ],
    function (EventAggregator,
              EmptyListView,
              EmptyGridView,
              GridColumnHeaderView,
              GridHeaderView,
              GridView,
              ListView,
              RowView,
              ScrollbarView,
              ListGroupViewBehavior,
              ListItemViewBehavior,
              GridItemViewBehavior,
              LoadingRowModel,
              ListGroupBehavior,
              ListItemBehavior,
              GridItemBehavior,
              factory,
              cellFactory) {
        'use strict';

        return /** @lends module:core.list */ {
            EventAggregator: EventAggregator,
            /**
             * Фабрика списков
             * @namespace
             * */
            factory: factory,
            /**
             * Фабрика ячеек
             * @namespace
             * */
            cellFactory: cellFactory,
            /**
             * Views-списка
             * @namespace
             * */
            views: {
                /**
                 * View для отображения пустого списка (нет строк)
                 * @namespace
                 * */
                EmptyListView: EmptyListView,
                /**
                 * View для отображения списка без колонок
                 * @namespace
                 * */
                EmptyGridView: EmptyGridView,
                /**
                 * View ячейки-заголовка (шапки) списка
                 * @namespace
                 * */
                GridColumnHeaderView: GridColumnHeaderView,
                /**
                 * View заголовка (шапки) списка
                 * @namespace
                 * */
                GridHeaderView: GridHeaderView,
                /**
                 * View-контейнер для заголовка и контента
                 * @namespace
                 * */
                GridView: GridView,
                /**
                 * View контента списка
                 * @namespace
                 * */
                ListView: ListView,
                /**
                 * View строки списка
                 * @namespace
                 * */
                RowView: RowView,
                /**
                 *
                 * View Scrollbar'а
                 * @namespace
                 * */
                ScrollbarView: ScrollbarView,
                behaviors: {
                    ListGroupViewBehavior: ListGroupViewBehavior,
                    ListItemViewBehavior: ListItemViewBehavior,
                    GridItemViewBehavior: GridItemViewBehavior
                }
            },
            /**
             * Backbone-модели списка
             * @namespace
             * */
            models: {
                LoadingRowModel:LoadingRowModel,
                behaviors: {
                    ListGroupBehavior: ListGroupBehavior,
                    ListItemBehavior: ListItemBehavior,
                    GridItemBehavior: GridItemBehavior
                }
            }
        };
    });
