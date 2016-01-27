/**
 * Developer: Stepan Burguchev
 * Date: 7/21/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Marionette, classes, Backbone, global */

"use strict";

import 'moment';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';
import 'bluebird';
import * as _ from 'underscore';
import * as underscoreString from 'underscore.string';
import * as Backbone from 'backbone';
import 'backbone-associations';
import 'backbone.forms';
import 'backbone.marionette';
import 'jquery';
import 'jquery.inputmask/dist/jquery.inputmask.bundle';
import 'jquery.caret';
import 'jquery-mousewheel';
import 'jquery-autosize';
import * as keypress from 'keypress';
import 'bootstrap-datetime-picker';

debugger;
_.string = _.str = underscoreString;
Backbone.Associations = Backbone.Backbone.Associations;


define([
    /*'keypress',
    'moment',
    'handlebars',
    'bluebird',
    'underscore',
    'underscore.string',

    'backbone',
    'backbone.associations',
    'backbone.forms',

    'marionette',

    'jquery',
    'jquery.mousewheel',
    'jquery.inputmask',
    'jquery.caret',
    'jquery.autosize',

    'datetimePicker',

    'moment.en',
    'moment.ru',
    'moment.de'*/
], function (keypress, moment, Handlebars, Promise, _, underscoreString) {
    'use strict';
	
	$.browser = {
        msie: (/msie|trident/i).test(navigator.userAgent)
    };
	
    var root = typeof global !== 'undefined' ? global : window;
    root.Handlebars = Handlebars;
    root.Promise = Promise;
    root.moment = moment;
    _.string = _.str = underscoreString;

    Backbone.Associations.EVENTS_NC = true;

    return {
		keypress: keypress,
        moment: moment
	};
});
