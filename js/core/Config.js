/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global require, define, module, __dirname */

module.exports = {
    paths: {
        underscore: 'lib/underscore/underscore',
        'underscore.string': 'lib/underscore.string/underscore.string',
        bluebird: 'lib/bluebird/bluebird',
        handlebars: 'lib/handlebars/handlebars',
        keypress: 'lib/Keypress/keypress-2.1.0.min',

        backbone: 'lib/backbone/backbone',
        'backbone.wreqr': 'lib/backbone.wreqr/backbone.wreqr',
        'backbone.babysitter': 'lib/backbone.babysitter/backbone.babysitter',
        'backbone.associations': 'lib/backbone.associations/backbone-associations',
        'backbone.forms': 'lib/backbone.forms/backbone-forms',

        marionette: 'lib/backbone.marionette/backbone.marionette',

        jquery: 'lib/jquery/jquery',
        'jquery.mousewheel': 'lib/jquery.mousewheel/jquery.mousewheel',
        'jquery.inputmask': 'lib/jquery.inputmask/jquery.inputmask.bundle',
        'jquery.caret': 'lib/jquery.caret/index',
        'jquery.autosize': 'lib/jquery.autosize/jquery.autosize',

        domReady: 'lib/requirejs/domReady',
        text: 'lib/requirejs/text',
        datetimePicker: 'lib/smalot-bootstrap-datetimepicker/bootstrap-datetimepicker.min',

        moment: 'lib/moment/moment',
        'moment.en': 'lib/moment/locale/en-gb',
        'moment.ru': 'lib/moment/locale/ru',
        'moment.de': 'lib/moment/locale/de',

        localizationMap: 'empty:',
        ajaxMap: 'empty:'
    },

    shim: {
        underscore: {
            exports: '_'
        },

        'underscore.string': ['underscore'],

        bluebird: {
            exports: 'Promise'
        },

        'keypress': [],

        'jquery': [],
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
};
