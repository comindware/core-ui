
import { $ } from 'lib'; //todo wtf
import core from 'coreApi';
import { dataProvider } from './utils/testData';
import localizationMap from 'localizationMap';
import 'jasmine-jquery';

setFixtures(
    '<div class="js-fading-region fading-container hidden"></div>\n' +
        '<div class="js-popup-region popup-container hidden"></div>\n' +
        '<div class="wrapper">\n' +
        '    <div class="js-navigation-region js-navigation-container wrapper__menu"></div>\n' +
        '    <div class="js-content-container wrapper__content">\n' +
        '        <div class="js-navigation-toolbar"></div>\n' +
        '        <div class="js-content-loading-region l-loader"></div>\n' +
        '        <div class="js-content-region layout"></div>\n' +
        '        <div class="js-toast-notification-region"></div>\n' +
        '    </div>\n' +
        '</div>'
);

core.Application.start({
    ajaxService: {
        ajaxMap: []
    },
    contentView: Marionette.View.extend({ template: false }),
    localizationService: {
        langCode: 'en',
        localizationMap,
        warningAsError: true
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
    serviceInitializer() {

    }
});

const context = require.context('./specs', true, /.+\.spec\.jsx?$/);
context.keys().forEach(context);

export default context;
