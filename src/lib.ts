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
// @ts-ignore
import { OldCollectionView } from 'marionette.oldcollectionview';
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
import 'innersvg-polyfill';

import domapi from './utils/DOMApi';

(<any>window)._ = _underscore.mixin(mixin.default);
// @ts-ignore
Marionette_.setDomApi(domapi);
// @ts-ignore
Marionette_.AppRouter = AppRouter;
// @ts-ignore
Marionette_.PartialCollectionView = OldCollectionView; 

(<any>window).Marionette = Marionette_;


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
