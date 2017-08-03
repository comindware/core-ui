/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

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
     * DropdownView, PopoutView and panel/button views useful in common cases.
     * @namespace
     * */
    views: {
        /**
         * Marionette Behavior which are required on panel/button views when some config options are enabled.
         * @namespace
         * */
        behaviors: {
            CustomAnchorBehavior
        },
        PopoutView,
        DropdownView,
        ListPanelView,
        MenuItemView,
        MenuPanelView,
        DefaultButtonView
    },
    factory
};
