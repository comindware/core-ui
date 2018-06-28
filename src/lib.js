//@flow
/* Data & Datatime utils*/
window.Backbone = {};

import moment_ from 'moment-timezone';
import '../node_modules/moment-timezone/moment-timezone-utils';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';
import CoreModel from './models/CoreModel';
import CoreCollection from './models/CoreCollection';
/* --- */
import mixin from './utils/underscore';
/* Core.Model utils */
import * as Marionette_ from 'backbone.marionette';
import './external/backbone.radio';
/* --- */
import 'jstorage';
import * as Handlebars_ from 'handlebars';
import autosize from 'autosize';

import numeral_ from 'numeral';
import 'numeral/locales/ru';
import 'numeral/locales/de';

import codemirror_ from 'codemirror/lib/codemirror';
import 'innersvg-polyfill';
import jsencrypt from 'jsencrypt';

window.numeral = numeral_;

window.Backbone.Model = CoreModel;
window.Backbone.Collection = CoreCollection;

const api = {
    moment: moment_,
    Handlebars: Handlebars_,
    _: window._,
    Marionette: Marionette_,
    numeral: numeral_,
    codemirror: codemirror_,
    JSEncrypt: jsencrypt.JSEncrypt,
    autosize
};

const moment = api.moment;
const Handlebars = api.Handlebars;
const _ = window._;
const Marionette = Marionette_;
const numeral = api.numeral;
const codemirror = api.codemirror;

export default api;
export { moment, Handlebars, Marionette, numeral, codemirror, autosize };
