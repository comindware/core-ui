/* Data & Datatime utils*/
import "core-js/stable";
import "regenerator-runtime/runtime";
// @ts-ignore
import moment_ from 'moment-timezone';
import '../node_modules/moment-timezone/moment-timezone-utils';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';

/* Text Mask */
// @ts-ignore
import maskInput from 'vanilla-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import emailMask from 'text-mask-addons/dist/emailMask';

/* --- */
import * as _underscore from 'underscore';

import * as mixin from './utils/underscore';
/* Core.Model utils */
import backbone from 'backbone';
import * as Marionette_ from 'backbone.marionette';
// @ts-ignore
import AppRouter from 'marionette.approuter';
import 'backbone-computedfields';
import 'backbone.radio';
import 'backbone-associations';
/* --- */
import * as Handlebars_ from 'handlebars';
import jquery from 'jquery';
// @ts-ignore
import autosize from 'autosize';

import CodeMirror from 'codemirror';

import domapi from './utils/DOMApi';

(<any>window)._ = _underscore.mixin(mixin.default);

(<any>window).Marionette = Marionette_;
(<any>window).Marionette.setDomApi(domapi);
(<any>window).Marionette.AppRouter = AppRouter;

const api = {
    moment: moment_,
    Handlebars: Handlebars_,
    $: jquery,
    Backbone: backbone,
    codemirror: CodeMirror,
    autosize,
    maskInput,
    createNumberMask,
    emailMask
};

const moment = api.moment;
const $ = api.$;
const codemirror = api.codemirror;
const _ = (<any>window)._;

export default api;
export { _, moment, $, codemirror, autosize, createNumberMask, maskInput, emailMask };
