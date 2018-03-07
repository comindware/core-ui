
import core from 'comindware/core';
import localizationMapEn from 'localizationMapEn';
import localizationMapDe from 'localizationMapDe';
import localizationMapRu from 'localizationMapRu';
import ajaxMap from './ajaxMap.json';
import dataProvider from 'demoPage/dataProvider';

const Application = new Marionette.Application();

Application.addRegions({
    headerRegion: '.js-header-region',
    contentRegion: '.js-content-region',
    navigationDrawerRegion: '.js-navigation-drawer-region'
});

Application.addInitializer(() => {
    const isProduction = process.env.NODE_ENV === 'production'; // jshint ignore:line

    const langCode = 'en'; // could be: window.navigator.language.substring(0, 2).toLowerCase();
    const localizationMap = { en: localizationMapEn, de: localizationMapDe, ru: localizationMapRu }[langCode];

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('serviceWorker.js').then(reg => {
            console.log(`Registration succeeded. Scope is ${reg.scope}`);
        }).catch(error => {
            console.log(`Registration failed with ${error}`);
        });
    }

    core.initialize({
        ajaxService: {
            ajaxMap
        },
        localizationService: {
            langCode,
            localizationMap,
            warningAsError: isProduction
        },
        userService: {
            dataProvider
        }
    });
});

export default Application;
