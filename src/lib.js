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
import backbone from 'backbone';
import 'backbone-associations';
import * as Marionette_ from 'backbone.marionette';
import $_ from 'jquery';
import 'inputmask/dist/jquery.inputmask.bundle';
import 'rangyinputs';
import 'jquery-mousewheel';
import 'jquery-autosize';
import * as keypress_ from 'keypress';
import 'bootstrap-datetime-picker';
import numeral_ from 'numeral';
import codemirror_ from 'codemirror/lib/codemirror';

// Replacing ES6 promise with bluebird
window.Promise = Bluebird_;

window.Promise.config({
    warnings: true,
    longStackTraces: true,
    cancellation: true
});

window._.string = window._.str = underscoreString;

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
    Backbone: backbone,
    Marionette: Marionette_,
    numeral: numeral_,
    codemirror: codemirror_
};
const keypress = api.keypress;
const moment = api.moment;
const Handlebars = api.Handlebars;
const $ = api.$;
const _ = window._;
const Backbone = backbone;
const Marionette = Marionette_;
const numeral = api.numeral;
const codemirror = api.codemirror;
export default api;
export {
    keypress,
    moment,
    Handlebars,
    $,
    _,
    Backbone,
    Marionette,
    numeral,
    codemirror
};

