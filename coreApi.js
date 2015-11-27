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

        './services/RoutingService',
        './services/ModuleService',
        './services/MessageService',
        './services/WindowService',
        './services/GlobalEventService',
        './services/LocalizationService',
        './services/AjaxService',

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

        RoutingService,
        ModuleService,
        MessageService,
        WindowService,
        GlobalEventService,
        LocalizationService,
        AjaxService,

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
                RoutingService: RoutingService,
                ModuleService: ModuleService,
                MessageService: MessageService,
                WindowService: WindowService,
                LocalizationService: LocalizationService,
                AjaxService: AjaxService,
                GlobalEventService: GlobalEventService
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
            form: formApi,
            list: listApi,
            nativeGrid: nativeGridApi,
            utils: utilsApi,
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
