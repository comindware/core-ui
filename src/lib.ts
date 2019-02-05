/* Data & Datatime utils*/

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
import 'backbone.modelbinder';
import 'backbone-computedfields';
import 'backbone.radio';
import 'backbone-associations';
/* --- */
import * as Handlebars_ from 'handlebars';
import jquery from 'jquery';
// @ts-ignore
import autosize from 'autosize';

import CodeMirror from 'codemirror';
import 'innersvg-polyfill';
// @ts-ignore
import * as jqui from 'jquery-ui';

import domapi from './utils/DOMApi';

(<any>window)._ = _underscore.mixin(mixin.default);
// @ts-ignore
Marionette_.setDomApi(domapi);

const api = {
    'jquery-ui': jqui,
    moment: moment_,
    Handlebars: Handlebars_,
    $: jquery,
    Backbone: backbone,
    Marionette: Marionette_,
    codemirror: CodeMirror,
    autosize,
    maskInput,
    createNumberMask,
    emailMask
};

const moment = api.moment;
const Handlebars = api.Handlebars;
const $ = api.$;
const Backbone = backbone;
const Marionette = Marionette_;
const codemirror = api.codemirror;
const _ = (<any>window)._;

export default api;
export { _, moment, Handlebars, $, Backbone, Marionette, codemirror, autosize, createNumberMask, maskInput, emailMask };
