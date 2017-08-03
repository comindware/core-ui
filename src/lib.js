/**
 * Developer: Stepan Burguchev
 * Date: 7/21/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import moment_ from 'moment';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';
import Bluebird_ from 'bluebird';
import * as Handlebars_ from 'handlebars';
import 'underscore';
import * as underscoreString from 'underscore.string';
import { Backbone as Backbone_ } from 'backbone';
import 'backbone-associations';
import * as Marionette_ from 'backbone.marionette';
import $_ from 'jquery';
import 'jquery.inputmask/dist/jquery.inputmask.bundle';
import 'rangyinputs';
import 'jquery-mousewheel';
import 'jquery-autosize';
import * as keypress_ from 'keypress';
import 'bootstrap-datetime-picker';
import numeral_ from 'numeral';

// Replacing ES6 promise with bluebird
window.Promise = Bluebird_;

window.Promise.config({
    warnings: true,
    longStackTraces: true,
    cancellation: true
});

window._.string = window._.str = underscoreString;

Backbone_.Associations.EVENTS_NC = true;

$_.browser = {
    msie: (/msie|trident/i).test(navigator.userAgent)
};

const api = {
    keypress: keypress_,
    moment: moment_,
    Handlebars: Handlebars_,
    Bluebird: Bluebird_,
    $: $_,
    _: window._,
    Backbone: Backbone_,
    Marionette: Marionette_,
    numeral: numeral_
};
export var keypress = api.keypress;
export var moment = api.moment;
export var Handlebars = api.Handlebars;
export var Bluebird = api.Bluebird;
export var $ = api.$;
export var _ = window._;
export var Backbone = Backbone_;
export var Marionette = Marionette_;
export var numeral = api.numeral;
export default api;
