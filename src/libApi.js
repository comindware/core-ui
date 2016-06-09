/**
 * Developer: Stepan Burguchev
 * Date: 7/21/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import moment_ from 'moment';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';
import Bluebird from 'bluebird';
import * as Handlebars_ from 'handlebars';
import 'underscore';
import * as underscoreString from 'underscore.string';
import 'backbone';
import 'backbone-associations';
import 'backbone.forms';
import 'backbone.marionette';
import 'jquery';
import 'jquery.inputmask/dist/jquery.inputmask.bundle';
import 'jquery.caret';
import 'jquery-mousewheel';
import 'jquery-autosize';
import * as keypress_ from 'keypress';
import 'bootstrap-datetime-picker';

// Replacing ES6 promise with bluebird
require('babel-runtime/core-js/promise').default = Bluebird;

Promise.config({
    warnings: false,
    longStackTraces: true,
    cancellation: true
});

_.string = _.str = underscoreString;

Backbone.Associations.EVENTS_NC = true;

$.browser = {
    msie: (/msie|trident/i).test(navigator.userAgent)
};

var api = {
    keypress: keypress_,
    moment: moment_,
    Handlebars: Handlebars_
};
export var keypress = api.keypress;
export var moment = api.moment;
export var Handlebars = api.Handlebars;
export default api;
