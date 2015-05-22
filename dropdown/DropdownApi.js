/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
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

        return {
            views: {
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
