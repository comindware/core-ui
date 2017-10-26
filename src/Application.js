/**
 * Developer: Vladislav Smirnov
 * Date: 10.9.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { helpers } from 'utils';
import { $ } from 'lib';
import { moment } from 'lib';
import AjaxService from 'services/AjaxService';
import GlobalEventService from 'services/GlobalEventService';
import UserService from 'services/UserService';
import WindowService from 'services/WindowService';
import LocalizationService from 'services/LocalizationService';
import CTEventsService from 'services/CTEventsService';
import WebSocketService from 'services/WebSocketService';
import RoutingService from 'services/RoutingService';
import ToastNotificationService from 'services/ToastNotificationService';
import 'backbone.trackit';

export default {
    start(options) {
        helpers.ensureOption(options, 'localizationService');
        helpers.ensureOption(options, 'ajaxService');
        helpers.ensureOption(options, 'userService');

        const marionetteApp = new Marionette.Application();
        window.application = marionetteApp;

        marionetteApp.addRegions(options.regions);
        marionetteApp.ui = options.ui;
        marionetteApp.registerAppModule = options.registerAppModule;
        marionetteApp.addInitializer(options.serviceInitializer);

        GlobalEventService.initialize();

        RoutingService.initialize({
            defaultUrl: options.RouterConfiguration.defaultUrl,
            modules: options.RouterConfiguration.modules
        });

        if (window.application.toastNotificationRegion) {
            ToastNotificationService.initialize({
                toastNotificationRegion: window.application.toastNotificationRegion,
                toastNotificationRegionEl: window.application.ui.toastNotificationRegion
            });
        }

        UserService.initialize(options.userService);
        WindowService.initialize();
        LocalizationService.initialize(options.localizationService);
        AjaxService.load(options.ajaxService);
        marionetteApp.defaultContentView = options.contentView;
        marionetteApp.options = options;

        const langCode = window.Context.langCode;

        moment.locale(langCode);

        CTEventsService.initialize();

        if (options.webSocketConfiguration && options.webSocketConfiguration.activateOnStart) {
            WebSocketService.initialize({ url: options.webSocketConfiguration.url });
        }

        // Backbone default behaviors path (obsolete because of inconsistency: we store behaviors in many different paths)
        Backbone.Marionette.Behaviors.behaviorsLookup = options.behaviors;

        this.initializeThirdParties();
        marionetteApp.start();
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
