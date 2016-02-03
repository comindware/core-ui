/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import factory from './Factory';
import filterViewFactory from './FilterViewFactory';
import RowView from './views/RowView';
import HeaderView from './views/HeaderView';
import NativeGridView from './views/NativeGridView';

export default /** @lends module:core.nativeGrid */  {
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
