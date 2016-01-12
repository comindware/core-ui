'use strict';

require.config({
	baseUrl: '/scripts/',
	waitSeconds: 60,
	paths: {
		'module/lib': 'lib',
		prism: 'lib/prism/prism',
		markdown: 'lib/markdown-js/markdown',
		'cmw.underscore': 'lib/cmw/underscore',

		Application: 'Application',
		demoPage: 'app/helpers',

		localizationMap: 'stubs/localizationMap',
		ajaxMap: 'stubs/ajaxMap'
	}
});

require(['comindware/core'], function() {
	require(
		['Application', './AppRouter', './AppController'],
		function(Application, AppRouter, AppController) {
			'use strict';
			
			Application.appRouter = new AppRouter({
	            controller: new AppController()
	        });
	        
	        Application.start();
	        Backbone.history.start();
		}
	);
}); 