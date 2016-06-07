'use strict';

require.config({
	baseUrl: 'scripts/',
	waitSeconds: 60,
	paths: {
		// libraries
		prism: 'lib/prism/prism',
		markdown: 'lib/markdown-js/markdown',
        domReady: 'lib/requirejs/domReady',
        text: 'lib/requirejs/text',

		// generated files
        localizationMap: 'localization/localizationMap.en',
		ajaxMap: 'ajax/ajaxMap',

		// demo page specific routing
		demoPage: 'app/helpers',

        // core paths
        "comindware/core": 'dist/core.bundle'
	},
    shim: {
    }
});

window.langCode = 'en';
window.compiled = false;

require([
        'comindware/core',
        'Application',
        'AppRouter',
        'AppController'
    ],
    function(core, Application, AppRouter, AppController) {
    Application.appRouter = new AppRouter({
        controller: new AppController()
    });

    Application.start();
    Backbone.history.start();
});
