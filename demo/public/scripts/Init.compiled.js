'use strict';

require.config({
	baseUrl: '/scripts/',
	waitSeconds: 60,
	paths: {
		// libraries
		prism: 'lib/prism/prism',
		markdown: 'lib/markdown-js/markdown',

		// generated files
		localizationMap: 'localization/localizationMap.en',
		ajaxMap: 'ajax/ajaxMap',

		// demo page specific routing
		demoPage: 'app/helpers',
		text: 'comindware/core'
	}
});

window.langCode = 'en';

require([
        'comindware/core',
        'Application',
        'AppRouter',
        'AppController'
    ],
    function(core, Application, AppRouter, AppController) {
    'use strict';

    Application.appRouter = new AppRouter({
        controller: new AppController()
    });

    Application.start();
    Backbone.history.start();
});
