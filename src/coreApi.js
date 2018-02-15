/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import '../resources/styles/bootstrap-datetimepicker.css';
import '../resources/styles/fonts.css';
import '../resources/styles/common.css';
import '../resources/styles/services/messageService.css';
import '../resources/styles/services/windowService.css';
import '../resources/styles/form.css';
import '../resources/styles/dropdown.css';
import '../resources/styles/popout.css';
import '../resources/styles/list.css';
import '../resources/styles/codemirror.css';
import '../node_modules/spectrum-colorpicker/spectrum.css';


import libApi from 'lib';
import utilsApi from 'utils';
import dropdownApi from 'dropdown';
import * as layoutApi from 'layout';
import listApi from 'list';
import nativeGridApi from './nativeGrid/nativeGridApi';
import editableGridApi from 'editableGrid';
import formApi from 'form';

import meta_ from './Meta';
import bootstrapper from './Bootstrapper';

import Controller from 'controller/Controller';
import Application from 'Application';

import LoadingView from './views/LoadingView';
import LoadingBehavior from './views/behaviors/LoadingBehavior';
import SearchBarView from './views/SearchBarView';
import SplitPanelView from './views/SplitPanelView';

import RoutingService from './services/RoutingService';
import ToastNotifications from './services/ToastNotificationService';
import MessageService from './services/MessageService';
import WindowService from './services/WindowService';
import GlobalEventService from './services/GlobalEventService';
import LocalizationService from './services/LocalizationService';
import AjaxService from './services/AjaxService';
import PromiseService from './services/PromiseService';
import UserService from './services/UserService';
import InterfaceErrorMessageService from './services/InterfaceErrorMessageService';

import SlidingWindowCollection from './collections/SlidingWindowCollection';
import VirtualCollection from './collections/VirtualCollection';
import CollectionHighlightableBehavior from './collections/behaviors/HighlightableBehavior';
import CollapsibleBehavior from './models/behaviors/CollapsibleBehavior';
import HighlightableBehavior from './models/behaviors/HighlightableBehavior';
import SelectableBehavior from './models/behaviors/SelectableBehavior';
import CheckableBehavior from './models/behaviors/CheckableBehavior';
import MobileService from './services/MobileService';

import NavigationDrawer from './components/navigationDrawer/NavigationDrawer';
import Toolbar from './components/toolbar/ToolbarView';

/**
 * Core UI components: основные компоненты для построение веб-интерфейса Comindware.
 * @name module:core
 * */
const core = {
    Controller,
    Application,
    RoutingService,
    ToastNotifications,
    lib: libApi,
    InterfaceError: InterfaceErrorMessageService,
    /**
     * Services of general use the UI is built on.
     * @namespace
     * @memberof module:core
     * */
    services: {
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
        UserService,
        MobileService
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
            SelectableBehavior,
            CheckableBehavior
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
     * Editable grid component without data virtualization.
     * @namespace
     * @memberof module:core
     * */
    editableGrid: editableGridApi,
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
    initialize: bootstrapper.initialize.bind(bootstrapper),
    components: {
        NavigationDrawer,
        Toolbar
    }
};

window.Core = core;

export default core;
export const lib = core.lib;
export const layout = core.layout;
export const services = core.services;
export const collections = core.collections;
export const models = core.models;
export const views = core.views;
export const dropdown = core.dropdown;
export const form = core.form;
export const list = core.list;
export const nativeGrid = core.nativeGrid;
export const editableGrid = core.editableGrid;
export const utils = core.utils;
export const meta = core.meta;
export const initialize = core.initialize;
