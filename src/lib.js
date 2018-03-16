/**
 * Developer: Stepan Burguchev
 * Date: 7/21/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* Data & Datatime utils*/
import moment_ from 'moment-timezone';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';
/* --- */
import underscoreLib from 'underscore';
import mixin from './utils/underscore';
/* Core.Model utils */
import backbone from 'backbone';
import * as Marionette_ from 'backbone.marionette';
import 'backbone.modelbinder';
import 'backbone-computedfields';
import 'backbone.radio';
import 'backbone-associations';
/* --- */
import 'jstorage';
import * as Handlebars_ from 'handlebars';
import $_ from 'jquery';
import 'inputmask/dist/jquery.inputmask.bundle';
import 'rangyinputs';
import 'jquery-autosize';
import * as keypress_ from 'keypress';
import 'bootstrap-datetime-picker';
import numeral_ from 'numeral';
import codemirror_ from 'codemirror/lib/codemirror';
import 'innersvg-polyfill';
import jsencrypt from 'jsencrypt';
import * as jqui from 'jquery-ui';

window._ = underscoreLib;
window._.mixin(mixin);

window.numeral = numeral_;

$_.browser = {
    msie: (/msie|trident/i).test(navigator.userAgent)
};

const api = {
    keypress: keypress_,
    'jquery-ui': jqui,
    moment: moment_,
    Handlebars: Handlebars_,
    $: $_,
    _: window._,
    Backbone: backbone,
    Marionette: Marionette_,
    numeral: numeral_,
    codemirror: codemirror_,
    JSEncrypt: jsencrypt.JSEncrypt
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
