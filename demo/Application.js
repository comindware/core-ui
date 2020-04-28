/* global process */

import localizationMapEn from 'localizationMapEn';
import localizationMapDe from 'localizationMapDe';
import localizationMapRu from 'localizationMapRu';
import ajaxMap from './ajaxMap.json';
import dataProvider from 'demoPage/dataProvider';
import ajaxStub from './ajaxStub/ajaxStub';
import DemoService from './app/DemoService';

const rootView = Marionette.View.extend({
    template: Handlebars.compile(`
        <div class="js-navigation-drawer-region"></div>
        <div class="wrapper">
            <div class="js-header-region header-container demo-nav">
                {{#each items}}
                    <a href="{{url}}" class="demo-nav__i">{{displayName}}</a>
                {{/each}}</div>
            <div class="js-content-region"></div>
            <div class="js-toast-notification-region"></div>
        </div>
    `),

    className: 'app-region-container',

    regions: {
        headerRegion: '.js-header-region',
        contentRegion: {
            el: '.js-content-region',
            replaceElement: true
        },
        navigationDrawerRegion: '.js-navigation-drawer-region',
        toastNotificationRegion: '.js-toast-notification-region'
    },

    templateContext() {
        return {
            items: DemoService.getSections()
        };
    }
});

export default Marionette.Application.extend({
    region: {
        el: '.js-app-region',
        replaceElement: true
    },

    onBeforeStart() {
        this.showView(new rootView());
    },

    onStart() {
        const isProduction = process.env.NODE_ENV === 'production';

        const langCode = 'en'; // could be: window.navigator.language.substring(0, 2).toLowerCase();
        const localizationMap = { en: localizationMapEn, de: localizationMapDe, ru: localizationMapRu }[langCode];

        Core.Application.start({
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
            },
            iconService: {
                style: 'solid',
                useBrands: false
            }
        });

        Core.ToastNotifications.initialize({
            toastNotificationRegion: this.getView().getRegion('toastNotificationRegion')
        });

        Backbone.history.start();

        ajaxStub.makeStub();
    }
});
