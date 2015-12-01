/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'module/lib',

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
                routing: {
                    ModuleProxy: ModuleProxy
                }
            },
            /**
             * Backbone-коллекции общего назначения
             * @namespace
             * */
            collections: {
                /**
                 * Behavior-объекты общего назначения для Backbone-коллекций.
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
             * Форма и редакторы (editors).
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
             * Вспомогательные утилиты
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
