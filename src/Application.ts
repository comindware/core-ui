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
import ThemeService from './services/ThemeService';
import getIconPrefixer from './utils/handlebars/getIconPrefixer';
import getIconUnicode from './utils/handlebars/getIconUnicode';
import getDocumentIcon from './utils/handlebars/getDocumentIcon';
import initializeDatePicker from './form/editors/impl/dateTime/views/initializeDatePicker';
import ContentLoadingView from './views/ContentLoadingView';

import 'backbone.trackit';

export default {
    async start(options) {
        const iconPrefixer = getIconPrefixer(options.iconService);
        Handlebars.registerHelper('iconPrefixer', iconPrefixer);
        Handlebars.registerHelper('iconUnicode', getIconUnicode(options.iconService));
        Handlebars.registerHelper('documentIcon', getDocumentIcon(iconPrefixer)); // must be registred after iconPrefixer

        LocalizationService.initialize(options.localizationService);
        ThemeService.initialize(options.themeService);

        const appView = window.app.getView();
        if (appView) {
            window.contentLoadingRegion = appView.getRegion('contentLoadingRegion');
            window.contentRegion = appView.getRegion('contentRegion');

            if (window.contentLoadingRegion) {
                this.__initializeLoadingMaskAndHideIt();
            }
        }

        const marionetteApp = new Marionette.Application();
        window.application = marionetteApp;

        marionetteApp.ui = options.ui;
        marionetteApp.registerAppModule = options.registerAppModule;

        GlobalEventService.initialize();
        InterfaceErrorMessageService.initialize();
        Core.services.MobileService.initialize();

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
        AjaxService.load(options.ajaxService);
        marionetteApp.defaultContentView = options.contentView;
        marionetteApp.options = options;

        CTEventsService.initialize();

        if (options.navigationConfiguration) {
            marionetteApp.navigationController = new options.navigationConfiguration.controller({
                configurationKey: options.navigationConfiguration.configurationKey
            });

            await window.application.navigationController.initializeModule();

            RoutingService.initialize({
                defaultUrl: window.application.navigationController.getDefaultUrl(),
                modules: options.routerConfiguration.modules
            });
        }

        if (options.webSocketConfiguration && options.webSocketConfiguration.activateOnStart) {
            WebSocketService.initialize({ url: options.webSocketConfiguration.url });
        }

        this.initializeThirdParties();
        marionetteApp.start();

        options.serviceInitializer && options.serviceInitializer.apply(marionetteApp);

        return marionetteApp;
    },

    initializeThirdParties() {
        const dates = {
            [LocalizationService.langCode]: {
                days: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSFULL').split(','), //["Sunday", "Monday", ... ]
                daysShort: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','), //["Sun", "Mon", ... ],
                daysMin: LocalizationService.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','),
                months: LocalizationService.get('CORE.FORMATS.DATETIME.MONTHS').split(','), //["January", "February", ... ]
                monthsShort: LocalizationService.get('CORE.FORMATS.DATETIME.MONTHSSHORT').split(','), //["Jan", "Feb", ... ]
                today: LocalizationService.get('CORE.FORMATS.DATETIME.TODAY'),
                meridiem: LocalizationService.get('CORE.FORMATS.DATETIME.MERIDIEM').split(',')
            }
        };
        initializeDatePicker(Backbone.$, dates);
    },

    __initializeLoadingMaskAndHideIt() {
        window.contentLoadingRegion.show(new ContentLoadingView());
    }
};
