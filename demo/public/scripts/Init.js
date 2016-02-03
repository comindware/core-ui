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

        // core paths
        comindware: 'dist',
        core: 'core/js/core',

        underscore: 'core/js/lib/underscore/underscore',
        'underscore.string': 'core/js/lib/underscore.string/underscore.string',
        bluebird: 'core/js/lib/bluebird/bluebird',
        handlebars: 'core/js/lib/handlebars/handlebars',
        keypress: 'core/js/lib/Keypress/keypress-2.1.0.min',

        backbone: 'core/js/lib/backbone/backbone',
        'backbone.wreqr': 'core/js/lib/backbone.wreqr/backbone.wreqr',
        'backbone.babysitter': 'core/js/lib/backbone.babysitter/backbone.babysitter',
        'backbone.associations': 'core/js/lib/backbone.associations/backbone-associations',
        'backbone.forms': 'core/js/lib/backbone.forms/backbone-forms',

        marionette: 'core/js/lib/backbone.marionette/backbone.marionette',

        jquery: 'core/js/lib/jquery/jquery',
        'jquery.mousewheel': 'core/js/lib/jquery.mousewheel/jquery.mousewheel',
        'jquery.inputmask': 'core/js/lib/jquery.inputmask/jquery.inputmask.bundle',
        'jquery.caret': 'core/js/lib/jquery.caret/index',
        'jquery.autosize': 'core/js/lib/jquery.autosize/jquery.autosize',

        domReady: 'core/js/lib/requirejs/domReady',
        text: 'core/js/lib/requirejs/text',
        datetimePicker: 'core/js/lib/smalot-bootstrap-datetimepicker/bootstrap-datetimepicker.min',

        moment: 'core/js/lib/moment/moment',
        'moment.en': 'core/js/lib/moment/locale/en-gb',
        'moment.ru': 'core/js/lib/moment/locale/ru',
        'moment.de': 'core/js/lib/moment/locale/de'
	},
    shim: {
        // core shim
        underscore: {
            exports: '_'
        },

        'underscore.string': ['underscore'],

        bluebird: {
            exports: 'Promise'
        },

        'keypress': [],

        'jquery': [],
        'jquery.jstorage': ['jquery'],
        'jquery.caret': ['jquery'],
        'jquery.mousewheel': ['jquery'],
        'jquery.inputmask': ['jquery'],
        'jquery.autosize': ['jquery'],

        backbone: {
            deps: ['jquery'],
            exports: 'Backbone'
        },
        'backbone.associations': ['backbone'],
        'backbone.forms': ['backbone'],

        marionette: {
            deps: ['backbone'],
            exports: 'Marionette'
        },

        datetimePicker: {
            deps: ['jquery']
        },

        'moment_en': ['moment'],
        'moment_ru': ['moment'],
        'moment_de': ['moment']
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
    'use strict';
debugger;
    Application.appRouter = new AppRouter({
        controller: new AppController()
    });

    Application.start();
    Backbone.history.start();
});
