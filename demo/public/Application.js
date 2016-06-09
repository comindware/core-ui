define([
	'comindware/core',
    'ajax/users',
    'localizationMap',
    'ajaxMap'
], function(core, usersStub, localizationMap) {
    'use strict';

    var Application = new Marionette.Application();

    Application.addRegions({
        fadingRegion: '.js-fading-region',
        popupRegion: '.js-popup-region',
        headerRegion: '.js-header-region',
        contentRegion: '.js-content-region'
    });

    Application.ui = {
        fadingRegion: $('.js-fading-region'),
        popupRegion: $('.js-popup-region')
    };

    Application.addInitializer(function() {
        let isProduction = process.env.NODE_ENV === 'production';
        let langCode = 'en';

        core.initialize({
            cacheService: usersStub,
            ajaxService: {
                ajaxMap: window.ajaxMap
            },
            localizationService: {
                langCode: langCode,
                localizationMap: localizationMap,
                warningAsError: isProduction
            },
            windowService: {
                fadingRegion: Application.fadingRegion,
                popupRegion: Application.popupRegion,
                ui: Application.ui
            }
        });
    });

    return Application;
});
