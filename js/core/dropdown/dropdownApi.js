/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import PopoutView from './views/PopoutView';
import DropdownView from './views/DropdownView';
import ListPanelView from './views/ListPanelView';
import MenuItemView from './views/MenuItemView';
import MenuPanelView from './views/MenuPanelView';
import DefaultButtonView from './views/DefaultButtonView';
import CustomAnchorBehavior from './views/behaviors/CustomAnchorBehavior';
import factory from './factory';

export default /** @lends module:core.dropdown */ {
    /**
     * Dropdown/Popout View и стандартные View, которые могут быть установлены в качестве кнопок и панелей.
     * @namespace
     * */
    views: {
        /**
         * Marionette Behavior, которые требуются для работы ряда кастомных View при установке в dropdown контролы.
         * @namespace
         * */
        behaviors: {
            CustomAnchorBehavior: CustomAnchorBehavior
        },
        PopoutView: PopoutView,
        DropdownView: DropdownView,
        ListPanelView: ListPanelView,
        MenuItemView: MenuItemView,
        MenuPanelView: MenuPanelView,
        DefaultButtonView: DefaultButtonView
    },
    factory: factory
};
