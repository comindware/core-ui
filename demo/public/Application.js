define([
    'comindware/core',
    'localizationMapEn',
    'localizationMapDe',
    'localizationMapRu',
    './ajaxMap.json',
    'demoPage/dataProvider'
], (core, localizationMapEn, localizationMapDe, localizationMapRu, ajaxMap, dataProvider) => {
    'use strict';

    const Application = new Marionette.Application();

    Application.addRegions({
        headerRegion: '.js-header-region',
        contentRegion: '.js-content-region'
    });

    Application.addInitializer(() => {
        const isProduction = process.env.NODE_ENV === 'production'; // jshint ignore:line

        const langCode = 'en'; // could be: window.navigator.language.substring(0, 2).toLowerCase();
        const localizationMap = { en: localizationMapEn, de: localizationMapDe, ru: localizationMapRu }[langCode];

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

    return Application;
});
