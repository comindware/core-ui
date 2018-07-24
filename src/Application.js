//@flow
import AjaxService from './services/AjaxService';
import GlobalEventService from './services/GlobalEventService';
import UserService from './services/UserService';
import WindowService from './services/WindowService';
import LocalizationService from './services/LocalizationService';
import CTEventsService from './services/CTEventsService';
import WebSocketService from './services/WebSocketService';
import RoutingService from './services/RoutingService';
import ToastNotificationService from './services/ToastNotificationService';
import InterfaceErrorMessageService from './services/InterfaceErrorMessageService';
import MobileService from './services/MobileService';
import ThemeService from './services/ThemeService';

import 'backbone.trackit';

export default {
    start(options) {
        const marionetteApp = new Marionette.Application();
        window.application = marionetteApp;

        marionetteApp.ui = options.ui;
        marionetteApp.registerAppModule = options.registerAppModule;

        GlobalEventService.initialize();
        InterfaceErrorMessageService.initialize();

        const toastNotificationRegion = options.toastNotificationRegion;

        if (toastNotificationRegion) {
            ToastNotificationService.initialize({
                toastNotificationRegion
            });
        }

        if (options.moduleConfiguration) {
            options.moduleConfiguration.ModuleService.initialize({ modules: options.routerConfiguration.modules });
        }

        options.userService && UserService.initialize(options.userService);
        WindowService.initialize();
        LocalizationService.initialize(options.localizationService);
        AjaxService.load(options.ajaxService);
        marionetteApp.defaultContentView = options.contentView;
        marionetteApp.options = options;

        const langCode = options.localizationService.langCode;

        moment.locale(langCode);

        CTEventsService.initialize();
        MobileService.initialize();

        if (options.navigationConfiguration) {
            marionetteApp.navigationController = new options.navigationConfiguration.controller({
                context: options.navigationConfiguration.context,
                configurationKey: options.navigationConfiguration.configurationKey
            });

            RoutingService.initialize({
                defaultUrl: window.application.navigationController.getDefaultUrl(),
                modules: options.routerConfiguration.modules
            });
        }

        if (options.webSocketConfiguration && options.webSocketConfiguration.activateOnStart) {
            WebSocketService.initialize({ url: options.webSocketConfiguration.url });
        }

        // Backbone default behaviors path (obsolete because of inconsistency: we store behaviors in many different paths)
        Backbone.Marionette.Behaviors.behaviorsLookup = options.behaviors;

        //this.initializeThirdParties();
        marionetteApp.start();

        options.serviceInitializer && options.serviceInitializer.apply(marionetteApp);

        ThemeService.initialize(options.themeService);

        return marionetteApp;
    },

    initializeThirdParties() {
        $.fn.datetimepicker.dates[LocalizationService.langCode] = {
            days: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSFULL').split(','), //["Sunday", "Monday", ... ]
            daysShort: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','), //["Sun", "Mon", ... ],
            daysMin: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','),
            months: LocalizationService.get('CORE.FORMATS.DATETIME.MONTHS').split(','), //["January", "February", ... ]
            monthsShort: LocalizationService.get('CORE.FORMATS.DATETIME.MONTHSSHORT').split(','), //["Jan", "Feb", ... ]
            today: LocalizationService.get('CORE.FORMATS.DATETIME.TODAY'),
            meridiem: LocalizationService.get('CORE.FORMATS.DATETIME.MERIDIEM').split(',')
        };
    }
};
