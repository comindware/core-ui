import localizationMapEn from 'localizationMapEn';
import localizationMapDe from 'localizationMapDe';
import localizationMapRu from 'localizationMapRu';
import ajaxMap from './ajaxMap.json';
import dataProvider from 'demoPage/dataProvider';

import core from 'comindware/core';

const root = typeof global !== 'undefined' ? global : window;

root.core = core;

const rootView = Marionette.View.extend({
    template: Handlebars.compile(`
        <div class="js-navigation-drawer-region"></div>
        <div class="wrapper">
            <div class="js-header-region header-container"></div>
            <div class="js-content-region content-container"></div>
            <div class="js-toast-notification-region"></div>
		</div>
    `),

    className: 'app-region-container',

    regions: {
        headerRegion: '.js-header-region',
        contentRegion: '.js-content-region',
        navigationDrawerRegion: '.js-navigation-drawer-region',
        toastNotificationRegion: '.js-toast-notification-region'
    }
});

export default Marionette.Application.extend({
    region: {
        el: '.js-app-region',
        replaceElement: true
    },

    onStart() {
        const isProduction = process.env.NODE_ENV === 'production'; // jshint ignore:line

        const langCode = 'en'; // could be: window.navigator.language.substring(0, 2).toLowerCase();
        const localizationMap = { en: localizationMapEn, de: localizationMapDe, ru: localizationMapRu }[langCode];

        this.showView(new rootView());

        core.Application.start({
            ajaxService: {
                ajaxMap
            },
            localizationService: {
                langCode,
                localizationMap,
                warningAsError: isProduction
            },
            themeService: {
                theme: 'new'
            },
            userService: {
                dataProvider
            }
        });

        Core.ToastNotifications.initialize({
            toastNotificationRegion: this.getView().getRegion('toastNotificationRegion')
        });

        Backbone.history.start();
    }
});
