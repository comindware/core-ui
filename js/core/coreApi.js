/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        './libApi',

        './utils/utilsApi',
        './dropdown/dropdownApi',
        './meta',
        './list/listApi',
        './form/formApi',
        './serviceLocator',
        './nativeGrid/nativeGridApi',

        './services/RoutingServiceBase',
        './services/MessageService',
        './services/WindowService',
        './services/GlobalEventService',
        './services/LocalizationService',
        './services/AjaxService',

        './services/routing/ModuleProxy',
        './services/PromiseServer',

        './collections/SlidingWindowCollection',
        './collections/VirtualCollection',
        './collections/behaviors/HighlightableBehavior',
        './models/behaviors/CollapsibleBehavior',
        './models/behaviors/HighlightableBehavior',
        './models/behaviors/SelectableBehavior',

        './views/behaviors/loading/views/LoadingView',

        './views/behaviors/LoadingBehavior',
        './views/behaviors/BlurableBehavior',
        './views/behaviors/PopupBehavior',

        './views/SearchBarView',
        './views/SplitPanelView',

        './Bootstrapper'
    ],
    function (
        lib,

        utilsApi,
        dropdownApi,
        meta,
        listApi,
        formApi,
        serviceLocator,
        nativeGridApi,

        RoutingServiceBase,
        MessageService,
        WindowService,
        GlobalEventService,
        LocalizationService,
        AjaxService,

        ModuleProxy,
        PromiseServer,

        SlidingWindowCollection,
        VirtualCollection,
        CollectionHighlightableBehavior,

        CollapsibleBehavior,
        HighlightableBehavior,
        SelectableBehavior,

        LoadingView,

        LoadingBehavior,
        BlurableBehavior,
        PopupBehavior,

        SearchBarView,
        SplitPanelView,

        Bootstrapper
    ) {
        'use strict';

        //noinspection UnnecessaryLocalVariableJS
        /**
         * Core UI components: основные компоненты для построение веб-интерфейса Comindware.
         * @exports core
         * */
        var exports = {
            lib: lib,
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
                PromiseServer: PromiseServer,
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
            form: formApi,
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
            bootstrapper: Bootstrapper
        };

        if (_.isFunction(lib.initialize)) {
            lib.initialize({
                core: exports
            });
        }

        return exports;
    });
