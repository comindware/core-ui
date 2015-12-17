/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require */

define([
        './views/PopoutView',
        './views/DropdownView',
        './views/ListPanelView',
        './views/MenuItemView',
        './views/MenuPanelView',
        './views/DefaultButtonView',

        './views/behaviors/CustomAnchorBehavior',

        './factory'
    ],
    function (PopoutView, DropdownView, ListPanelView, MenuItemView, MenuPanelView, DefaultButtonView, CustomAnchorBehavior, factory) {
        'use strict';

        return /** @lends module:core.dropdown */ {
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
    });
