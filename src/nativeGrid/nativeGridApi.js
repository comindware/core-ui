/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import factory from './factory';
import filterViewFactory from './filterViewFactory';
import RowView from './views/RowView';
import HeaderView from './views/HeaderView';
import ColumnHeaderView from './views/ColumnHeaderView';
import NativeGridView from './views/NativeGridView';

export default /** @lends module:core.nativeGrid */  {
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
