define([
	'comindware/core',
    './stubs/usersStub'
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

        core.bootstrapper.initialize({
            cacheService: usersStub
        });
    });

    return Application;
});
