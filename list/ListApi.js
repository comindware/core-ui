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
        './views/ScrollbarView',
        './views/behaviors/ListGroupViewBehavior',
        './views/behaviors/ListItemViewBehavior',
        './views/behaviors/GridItemViewBehavior',
        './models/behaviors/ListGroupBehavior',
        './models/behaviors/ListItemBehavior',
        './models/behaviors/GridItemBehavior',
        './factory',
        'module/utils'
    ],
    function (EventAggregator,
              EmptyListView,
              EmptyGridView,
              GridColumnHeaderView,
              GridHeaderView,
              GridView,
              ListView,
              ScrollbarView,
              ListGroupViewBehavior,
              ListItemViewBehavior,
              GridItemViewBehavior,
              ListGroupBehavior,
              ListItemBehavior,
              GridItemBehavior,
              factory) {
        'use strict';

        return {
            EventAggregator: EventAggregator,
            factory: factory,
            views: {
                EmptyListView: EmptyListView,
                EmptyGridView: EmptyGridView,
                GridColumnHeaderView: GridColumnHeaderView,
                GridHeaderView: GridHeaderView,
                GridView: GridView,
                ListView: ListView,
                ScrollbarView: ScrollbarView,
                behaviors: {
                    ListGroupViewBehavior: ListGroupViewBehavior,
                    ListItemViewBehavior: ListItemViewBehavior,
                    GridItemViewBehavior: GridItemViewBehavior
                }
            },
            models: {
                behaviors: {
                    ListGroupBehavior: ListGroupBehavior,
                    ListItemBehavior: ListItemBehavior,
                    GridItemBehavior: GridItemBehavior
                }
            }
        };
    });
