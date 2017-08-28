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

import libApi from 'lib';
import utilsApi from 'utils';
import dropdownApi from 'dropdown';
import * as layoutApi from 'layout';
import listApi from 'list';
import nativeGridApi from './nativeGrid/nativeGridApi';
import formApi from 'form';

import meta_ from './Meta';
import bootstrapper from './Bootstrapper';

import LoadingView from './views/LoadingView';
import LoadingBehavior from './views/behaviors/LoadingBehavior';
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
const core = {
    lib: libApi,
    /**
     * Services of general use the UI is built on.
     * @namespace
     * @memberof module:core
     * */
    services: {
        RoutingServiceBase,
        MessageService,
        /**
         * The service is responsible for displaying global windows. For example, modal dialogs (popups).
         * @namespace
         * @memberof module:core.services
         * */
        WindowService,
        LocalizationService,
        AjaxService,
        /**
         * The services provides an interface to global window events, so you could easily subscribe
         * to them through <code>this.listenTo(GlobalEventService, ...)</code> in you views.
         * @namespace
         * @memberof module:core.services
        * */
        GlobalEventService,
        PromiseService,
        UserService
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
        SlidingWindowCollection,
        VirtualCollection
    },
    /**
     * Backbone models of general use.
     * @namespace
     * @memberof module:core
     * */
    models: {
        behaviors: {
            CollapsibleBehavior,
            HighlightableBehavior,
            SelectableBehavior
        }
    },
    views: {
        behaviors: {
            LoadingBehavior
        },
        LoadingView,
        SearchBarView,
        SplitPanelView
    },
    /**
     * Dropdown components of general use. It may be used in menus, dropdown lists and more complex cases like displaying some fancy about-me panel.
     * @namespace
     * @memberof module:core
     * */
    dropdown: dropdownApi,

    layout: layoutApi,
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
export var layout = core.layout;
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
