/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

import '../resources/styles/bootstrap-datetimepicker.css';
import '../resources/styles/fonts.css';
import '../resources/styles/common.css';
import '../resources/styles/services/messageService.css';
import '../resources/styles/services/windowService.css';
import '../resources/styles/form.css';
import '../resources/styles/dropdown.css';
import '../resources/styles/popout.css';
import '../resources/styles/list.css';

import libApi from './libApi';
import utilsApi from './utils/utilsApi';
import dropdownApi from './dropdown/dropdownApi';
import listApi from './list/listApi';
import nativeGridApi from './nativeGrid/nativeGridApi';
import formApi from './form/formApi';

import meta_ from './Meta';
import bootstrapper from './Bootstrapper';

import LoadingView from './views/LoadingView';
import LoadingBehavior from './views/behaviors/LoadingBehavior';
import BlurableBehavior from './views/behaviors/BlurableBehavior';
import SearchBarView from './views/SearchBarView';
import SplitPanelView from './views/SplitPanelView';

import RoutingServiceBase from './services/RoutingServiceBase';
import MessageService from './services/MessageService';
import WindowService from './services/WindowService';
import GlobalEventService from './services/GlobalEventService';
import LocalizationService from './services/LocalizationService';
import AjaxService from './services/AjaxService';
import PromiseService from './services/PromiseService';
import UserService from './services/UserService';

import SlidingWindowCollection from './collections/SlidingWindowCollection';
import VirtualCollection from './collections/VirtualCollection';
import CollectionHighlightableBehavior from './collections/behaviors/HighlightableBehavior';
import CollapsibleBehavior from './models/behaviors/CollapsibleBehavior';
import HighlightableBehavior from './models/behaviors/HighlightableBehavior';
import SelectableBehavior from './models/behaviors/SelectableBehavior';

/**
 * Core UI components: основные компоненты для построение веб-интерфейса Comindware.
 * @name module:core
 * */
var core = {
    lib: libApi,
    /**
     * Services of general use the UI is built on.
     * @namespace
     * @memberof module:core
     * */
    services: {
        RoutingServiceBase: RoutingServiceBase,
        MessageService: MessageService,
        /**
         * The service is responsible for displaying global windows. For example, modal dialogs (popups).
         * @namespace
         * @memberof module:core.services
         * */
        WindowService: WindowService,
        LocalizationService: LocalizationService,
        AjaxService: AjaxService,
        /**
         * The services provides an interface to global window events, so you could easily subscribe
         * to them through <code>this.listenTo(GlobalEventService, ...)</code> in you views.
         * @namespace
         * @memberof module:core.services
        * */
        GlobalEventService: GlobalEventService,
        PromiseService: PromiseService,
        UserService: UserService
    },
    /**
     * Backbone collections of general use.
     * @namespace
     * @memberof module:core
     * */
    collections: {
        /**
         * Backbone collection behaviors of general use.
         * @namespace
         * @memberof module:core.collections
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
     * @memberof module:core
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
     * @memberof module:core
     * */
    dropdown: dropdownApi,
    /**
     * A large set of editors and related classes built on top of [Backbone.Form](https://github.com/powmedia/backbone-forms) library.
     * @namespace
     * @memberof module:core
     * */
    form: formApi,
    /**
     * List and Grid components with data virtualization.
     * @namespace
     * @memberof module:core
     * */
    list: listApi,
    /**
     * List and Grid components without data virtualization.
     * @namespace
     * @memberof module:core
     * */
    nativeGrid: nativeGridApi,
    /**
     * Combines useful helper classes, functions and constants.
     * @namespace
     * @memberof module:core
     * */
    utils: utilsApi,
    /**
     * Constants used inside the library.
     * @namespace
     * @memberof module:core
     * */
    meta: meta_,
    initialize: bootstrapper.initialize.bind(bootstrapper)
};

export default core;
export var lib = core.lib;
export var services = core.services;
export var collections = core.collections;
export var models = core.models;
export var views = core.views;
export var dropdown = core.dropdown;
export var form = core.form;
export var list = core.list;
export var nativeGrid = core.nativeGrid;
export var utils = core.utils;
export var meta = core.meta;
export var initialize = core.initialize;
