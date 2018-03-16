/* eslint-disable */
import coreApi from '../src/coreApi';
import momentT from 'moment';
import Underscore from 'underscore';
import numeralT from 'numeral';
import backboneT from 'backbone';

declare var Handlebars: any;

declare var _: Underscore;

declare var Core: coreApi;

declare var Marionette: any;

declare var keypress: any;

declare var moment: momentT;

declare var Backbone: backboneT;

declare var numeral: numeralT;

declare var Localizer: {
    get(string): string,

    tryGet(string): string,

    resolveLocalizedText(string): string
};
