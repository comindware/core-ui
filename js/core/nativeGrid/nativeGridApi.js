/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, _, console */

define(['./Factory',
        './FilterViewFactory',
        './views/RowView',
        './views/HeaderView',
        './views/NativeGridView',
        'core/libApi'
    ],
    function (factory, filterViewFactory, RowView, HeaderView, NativeGridView) {
        'use strict';

        return /** @lends module:core.nativeGrid */  {
            /**
             * Фабрика списков
             * @namespace
             * */
            factory: factory,
            /**
             * Фабрика фильтров
             * @namespace
             * */
            filterViewFactory: filterViewFactory,
            /**
             * Views-списка
             * @namespace
             * */
            views: {
                RowView: RowView,
                HeaderView: HeaderView,
                NativeGridView: NativeGridView
            }
        };
    });
