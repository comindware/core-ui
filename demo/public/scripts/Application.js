define([
	'comindware/core',
    'ajax/users',
    'localizationMap',
    'ajaxMap'
], function(core, usersStub) {
    'use strict';

    var Application = new Marionette.Application();

    Application.addRegions({
        fadingRegion: '.js-fading-region',
        popupRegion: '.js-popup-region',
        contentRegion: '.js-content-region'
    });

    Application.ui = {
        fadingRegion: $('.js-fading-region'),
        popupRegion: $('.js-popup-region')
    };

    Application.addInitializer(function() {
        core.services.WindowService.initialize({
            fadingRegion: Application.fadingRegion,
            popupRegion: Application.popupRegion,
            ui: Application.ui
        });

        debugger;
        core.bootstrapper.initialize({
            cacheService: usersStub,
            ajaxService: {
                ajaxMap: window.ajaxMap
            },
            localizationService: {
                langCode: window.langCode,
                localizationMap: window['LANGMAP' + window.langCode.toUpperCase()],
                warningAsError: window.compiled
            }
        });
    });

    return Application;
});
