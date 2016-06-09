/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

"use strict";

import '../resources/styles/bootstrap-datetimepicker.css';
import '../resources/styles/common.css';
import '../resources/styles/core.css';
import '../resources/styles/dev.css';
import '../resources/styles/dropdown.css';
import '../resources/styles/fonts.css';
import '../resources/styles/form.css';
import '../resources/styles/list.css';
import '../resources/styles/pop.out.css';
import '../resources/styles/scrollbar.css';
import '../resources/styles/splitPanel.css';

import libApi from './libApi';
import utilsApi from './utils/utilsApi';
import dropdownApi from './dropdown/dropdownApi';
import listApi from './list/listApi';
import nativeGridApi from './nativeGrid/nativeGridApi';
import formApi from './form/formApi';

import meta_ from './Meta';
import serviceLocator_ from './serviceLocator';
import bootstrapper from './Bootstrapper';

import LoadingView from './views/LoadingView';
import LoadingBehavior from './views/behaviors/LoadingBehavior';
import BlurableBehavior from './views/behaviors/BlurableBehavior';
import SearchBarView from './views/SearchBarView';
import SplitPanelView from './views/SplitPanelView';
import FadingPanelView from './views/FadingPanelView';

import RoutingServiceBase from './services/RoutingServiceBase';
import MessageService from './services/MessageService';
import WindowService from './services/WindowService';
import GlobalEventService from './services/GlobalEventService';
import LocalizationService from './services/LocalizationService';
import AjaxService from './services/AjaxService';
import PromiseService from './services/PromiseService';

import SlidingWindowCollection from './collections/SlidingWindowCollection';
import VirtualCollection from './collections/VirtualCollection';
import CollectionHighlightableBehavior from './collections/behaviors/HighlightableBehavior';
import CollapsibleBehavior from './models/behaviors/CollapsibleBehavior';
import HighlightableBehavior from './models/behaviors/HighlightableBehavior';
import SelectableBehavior from './models/behaviors/SelectableBehavior';

/**
 * Core UI components: основные компоненты для построение веб-интерфейса Comindware.
 * @exports core
 * */
var api = {
    lib: libApi,
    /**
     * Services of general use the UI is built on.
     * @namespace
     * */
    services: {
        RoutingServiceBase: RoutingServiceBase,
        MessageService: MessageService,
        WindowService: WindowService,
        LocalizationService: LocalizationService,
        AjaxService: AjaxService,
        GlobalEventService: GlobalEventService,
        PromiseService: PromiseService
    },
    /**
     * Backbone collections of general use.
     * @namespace
     * */
    collections: {
        /**
         * Backbone collection behaviors of general use.
         * @namespace
         * */
        behaviors: {
            HighlightableBehavior: CollectionHighlightableBehavior
        },
        SlidingWindowCollection: SlidingWindowCollection,
        VirtualCollection: VirtualCollection
    },
    /**
     * Backbone models of general use.
     * @namespace
     * */
    models: {
        behaviors: {
            CollapsibleBehavior: CollapsibleBehavior,
            HighlightableBehavior: HighlightableBehavior,
            SelectableBehavior: SelectableBehavior
        }
    },
    views: {
        behaviors: {
            LoadingBehavior: LoadingBehavior,
            BlurableBehavior: BlurableBehavior
        },
        LoadingView: LoadingView,
        SearchBarView: SearchBarView,
        SplitPanelView: SplitPanelView
    },
    /**
     * Dropdown components of general use. It may be used in menus, dropdown lists and more complex cases like displaying some fancy about-me panel.
     * @namespace
     * */
    dropdown: dropdownApi,
    /**
     * A large set of editors and related classes built on top of [Backbone.Form](https://github.com/powmedia/backbone-forms) library.
     * @namespace
     * */
    form: formApi,
    /**
     * List and Grid components with data virtualization.
     * @namespace
     * */
    list: listApi,
    /**
     * List and Grid components without data virtualization.
     * @namespace
     * */
    nativeGrid: nativeGridApi,
    /**
     * Combines useful helper classes, functions and constants.
     * @namespace
     * */
    utils: utilsApi,
    /**
     * Constants used inside the library.
     * @namespace
     * */
    meta: meta_,
    initialize: bootstrapper.initialize.bind(bootstrapper)
};

export default api;
export var lib = api.lib;
export var services = api.services;
export var collections = api.collections;
export var models = api.models;
export var views = api.views;
export var dropdown = api.dropdown;
export var form = api.form;
export var list = api.list;
export var nativeGrid = api.nativeGrid;
export var utils = api.utils;
export var meta = api.meta;
export var initialize = api.initialize;
