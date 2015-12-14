/**
 * Developer: Stepan Burguchev
 * Date: 7/21/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Marionette, classes, Backbone, global */

define([
	'keypress',
    'moment',
    'd3',
    'handlebars',
    'bluebird',
    'underscoreString',
    'markdown',
    'datetimePicker',
    'lib/jquery.ui/jquery-ui',
    'lib/jquery.signalr/jquery.signalR',
	'hubs',
    'lib/jquery.validation/jquery.validate',
    'jqueryTmpl',
    'jqueryAddress',
    'jqueryCaret',
    'jqueryAutosize',
    'jqueryAutoResize',
	'jqueryTabslet',
    'lib/jStorage/jstorage',
    'lib/keymaster/keymaster',
    'jqueryMousewheel',
    'jqueryInputmask',
	'xregexp',
    'js/util/MarionetteLoader',
    'backboneRadio',
    'backboneAssociations',
    'backboneForms',
    'backboneComputedfields',
    'backboneSelect',
    'backboneTrackit',
	'bossview',
    'modelBinder',
    'js/util/Math',
    'js/util/ListenersObservable',
    'js/util/Keyboard',
    'js/util/Hash',
    'js/util/Css',
    'js/util/UUID',
    'js/util/TimeZone',
    'moment-locale-en',
    'moment-locale-ru',
    'moment-locale-de',
    'shared/utils/polyfills'
], function (keypress, moment, d3, Handlebars, Promise, underscoreString) {
    'use strict';
	
	$.browser = {
        msie: (/msie|trident/i).test(navigator.userAgent)
    };
	
    var root = typeof global !== 'undefined' ? global : window;
    root.Handlebars = Handlebars;
    root.Promise = Promise;
    root.moment = moment;
    _.string = _.str = underscoreString;

    if (window.flag_debug) {
        Promise.longStackTraces();
    }

    Backbone.Associations.EVENTS_NC = true;

    return {
		keypress: keypress,
        moment: moment,
        d3: d3,
        XRegExp: root.XRegExp,
        markdown: root.markdown
	};
});
