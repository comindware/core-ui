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
             * @class
             * */
            factory: factory,
            /**
             * Фабрика ячеек
             * @class
             * */
            cellFactory: cellFactory,
            /**
             * Views-списка
             * @namespace
             * */
            views: {
                /**
                 * View используемый по умолчанию для отображения пустого списка (нет строк), передавать в {@link module:core.list.views.GridView GridView options.emptyView}
                 * @class
                 * */
                EmptyListView: EmptyListView,
                /**
                 * View используемый по умолчанию для отображения списка без колонок, передавать в {@link module:core.list.views.GridView GridView options.noColumnsView}
                 * @class
                 * */
                EmptyGridView: EmptyGridView,
                /**
                 * View используемый по умолчанию для отображения ячейки заголовка (шапки) списка, передавать в {@link module:core.list.views.GridView GridView options.gridColumnHeaderView}
                 * @class
                 * */
                GridColumnHeaderView: GridColumnHeaderView,
                /**
                 * View используемый для отображения заголовка (шапки) списка
                 * @class
                 * */
                GridHeaderView: GridHeaderView,

                GridView: GridView,
                /**
                 * View контента списка
                 * @class
                 * * */
                ListView: ListView,
                /**
                 * View используемый по умолчанию для отображения строки списка, передавать в {@link module:core.list.views.GridView GridView options.childView}
                 * @class
                 * */
                RowView: RowView,
                /**
                 *
                 * View Scrollbar'а
                 * @class
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
