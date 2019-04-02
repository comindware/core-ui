import { $ } from 'lib'; //todo wtf
import core from 'coreApi';
import { dataProvider } from './utils/testData';
import ajaxStub from './utils/ajaxStub';
import localizationMap from 'localizationMap';
import 'jasmine-jquery';

core.form.editors.impl.common.initializeDatePicker($);

const rootView = Marionette.View.extend({
    template: Handlebars.compile(`
        <div class="js-fading-region fading-container hidden"></div>
<div class="js-popup-region popup-container hidden"></div>
<div class="wrapper">
    <div class="js-navigation-region js-navigation-container wrapper__menu"></div>
    <div class="js-content-container wrapper__content">
        <div class="js-navigation-toolbar"></div>
        <div class="js-content-loading-region l-loader"></div>
        <div class="js-content-region layout"></div>
        <div class="js-toast-notification-region"></div>
    </div>
</div>
    `),

    className: 'app-region-container',

    regions: {
        navigationRegion: '.js-navigation-region',
        contentRegion: '.js-content-region',
        navigationToolbarRegion: '.js-navigation-toolbar',
        contentLoadingRegion: '.js-content-loading-region',
        popupRegion: '.js-popup-region',
        toastNotificationRegion: '.js-toast-notification-region'
    }
});

document.body.insertAdjacentHTML('afterbegin', '<div class="js-app-region"></div>');

const Application = Marionette.Application.extend({
    region: {
        el: '.js-app-region',
        replaceElement: true
    },

    onStart() {
        this.showView(new rootView());
        core.Application.start({
            ajaxService: {
                ajaxMap: []
            },
            themeService: {
                theme: 'new',
                themesPath: '../dist/themes/'
            },
            contentView: Marionette.View.extend({ template: _.noop, }),
            localizationService: {
                langCode: 'en',
                localizationMap,
                warningAsError: true,
                timeZone: 'Europe/Moscow'
            },
            userService: {
                dataProvider
            },
            regions: {
                navigationRegion: '.js-navigation-region',
                contentRegion: '.js-content-region',
                navigationToolbarRegion: '.js-navigation-toolbar',
                contentLoadingRegion: '.js-content-loading-region',
                popupRegion: '.js-popup-region',
                toastNotificationRegion: '.js-toast-notification-region'
            },
            windowService: {
                popupRegion: '.js-popup-region',
                animation: false,
                ui: {
                    contentContainer: $('.js-content-container'),
                    navigationContainer: $('.js-navigation-container'),
                    popupRegion: $('.js-popup-region'),
                    toastNotificationRegion: $('.js-toast-notification-region')
                }
            },
            ui: {
                contentContainer: $('.js-content-container'),
                navigationToolbar: $('.js-navigation-toolbar'),
                navigationContainer: $('.js-navigation-container'),
                popupRegion: $('.js-popup-region'),
                toastNotificationRegion: $('.js-toast-notification-region')
            },
            serviceInitializer() { }
        });

        ajaxStub.initialize();

        const context = require.context('./specs', true, /.+\.spec\.jsx?$/);
        context.keys().forEach(context);
    }
});

const app = new Application();
window.app = app;
app.start();
