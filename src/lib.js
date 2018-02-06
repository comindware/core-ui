
/* Data & Datatime utils*/
import moment_ from 'moment-timezone';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';
/* --- */
/* Core.Model utils */
import backbone from 'backbone';
import * as Marionette_ from 'backbone.marionette';
import 'backbone.modelbinder';
import 'backbone-computedfields';
import 'backbone.select';
import 'backbone.radio';
import 'backbone-associations';
/* --- */
import 'jstorage';
import * as Handlebars_ from 'handlebars';
import $_ from 'jquery';
import 'inputmask/dist/jquery.inputmask.bundle';
import 'rangyinputs';
import 'jquery-autosize';
import 'bootstrap-datetime-picker';
import numeral_ from 'numeral';
import codemirror_ from 'codemirror/lib/codemirror';

window.numeral = numeral_;

$_.browser = {
    msie: (/msie|trident/i).test(navigator.userAgent)
};

const api = {
    moment: moment_,
    Handlebars: Handlebars_,
    $: $_,
    Backbone: backbone,
    Marionette: Marionette_,
    numeral: numeral_,
    codemirror: codemirror_,
};

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
    moment,
    Handlebars,
    $,
    _,
    Backbone,
    Marionette,
    numeral,
    codemirror
};
