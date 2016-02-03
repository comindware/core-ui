/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

"use strict";

import libApi from './libApi';
import utilsApi from './utils/utilsApi';
import dropdownApi from './dropdown/dropdownApi';
import listApi from './list/listApi';
import nativeGridApi from './nativeGrid/nativeGridApi';

import meta from './Meta';
import serviceLocator from './serviceLocator';
import bootstrapper from './Bootstrapper';

import LoadingView from './views/LoadingView';
import LoadingBehavior from './views/behaviors/LoadingBehavior';
import BlurableBehavior from './views/behaviors/BlurableBehavior';
import PopupBehavior from './views/behaviors/PopupBehavior';
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

import ModuleProxy from './services/routing/ModuleProxy';

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
     * Базовые сервисы системы
     * @namespace
     * */
    services: {
        RoutingServiceBase: RoutingServiceBase,
        MessageService: MessageService,
        WindowService: WindowService,
        LocalizationService: LocalizationService,
        AjaxService: AjaxService,
        GlobalEventService: GlobalEventService,
        PromiseService: PromiseService,
        routing: {
            ModuleProxy: ModuleProxy
        }
    },
    /**
     * Backbone collections of general use.
     * @namespace
     * */
    collections: {
        /**
         * Backbone.Collection behaviors of general use.
         * @namespace
         * */
        behaviors: {
            HighlightableBehavior: CollectionHighlightableBehavior
        },
        SlidingWindowCollection: SlidingWindowCollection,
        VirtualCollection: VirtualCollection
    },
    /**
     * Backbone-модели общего назначения
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
            BlurableBehavior: BlurableBehavior,
            PopupBehavior: PopupBehavior
        },
        LoadingView: LoadingView,
        SearchBarView: SearchBarView,
        SplitPanelView: SplitPanelView
    },
    /**
     * Dropdown-компоненты. Должны использоваться для любой логики выпадающих меню, панелей и подобного.
     * Не подпадающий под концепцию этих компонентов дизайн выпадающих элементов должен быть пересмотрен.
     * @namespace
     * */
    dropdown: dropdownApi,
    /**
     * Работа с данными: форма и редакторы. Базируется на библиотеке [Backbone.Form](https://github.com/powmedia/backbone-forms).
     * @namespace
     * */
    form: null/*formApi*/,
    /**
     * Списки
     * @namespace
     * */
    list: listApi,
    /**
     * Список с native-скроллом
     * @namespace
     * */
    nativeGrid: nativeGridApi,
    /**
     * Объединяет набор сервисов и справочников общего назначения.
     * @namespace
     * */
    utils: utilsApi,
    /**
     * Мета-информация
     * @namespace
     * */
    meta: meta,
    serviceLocator: serviceLocator,
    initialize: bootstrapper.initialize.bind(bootstrapper)
};

export default api;
