//@flow
import 'core-js/stable';
import '../resources/styles/date-picker.css';
import '../resources/styles/fonts.css';
import '../resources/styles/common.css';
import '../resources/styles/gallery.css';
import '../resources/styles/services/messageService.css';
import '../resources/styles/services/windowService.css';
import '../resources/styles/form.css';
import '../resources/styles/dropdown.css';
import '../resources/styles/popout.css';
import '../resources/styles/list.css';
import '../resources/styles/codemirror.css';
import '../resources/styles/layout-designer.css';
import '../resources/styles/notifications.css';
import '../resources/styles/blink-checkbox.css';
import '../node_modules/spectrum-colorpicker/spectrum.css';

import libApi from 'lib';
import utilsApi from 'utils';
import dropdownApi from 'dropdown';
import * as layoutApi from './layout';
import formApi from 'form';
import listApi from 'list';

import meta_ from './Meta';

import Controller from './controller/Controller';
import Application from './Application';

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
import ThemeService from './services/ThemeService';
import TestService from './services/TestService';
import UIService from './services/UIService';

import VirtualCollection from './collections/VirtualCollection';
import SelectableBehavior from './models/behaviors/SelectableBehavior';
import MobileService from './services/MobileService';

import NavigationDrawer from './components/navigationDrawer/NavigationDrawer';
import Toolbar from './components/toolbar/ToolbarView';
import VideoChat from './components/videoChat/VideoChat';

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
        MobileService,
        ThemeService,
        TestService,
        UIService
    },
    /**
     * Backbone collections of general use.
     * @namespace
     * @memberof module:core
     * */
    collections: {
        VirtualCollection
    },
    /**
     * Backbone models of general use.
     * @namespace
     * @memberof module:core
     * */
    models: {
        behaviors: {
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
    components: {
        NavigationDrawer,
        Toolbar,
        VideoChat
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
export const utils = core.utils;
export const meta = core.meta;
