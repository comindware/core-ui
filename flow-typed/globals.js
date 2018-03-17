/* eslint-disable */
import coreApi from '../src/coreApi';
import momentT from 'moment';
import Underscore from 'underscore';
import numeralT from 'numeral';
import backboneT from 'backbone';

declare var _: Underscore;

declare var Core: coreApi;

declare var Marionette: any; //todo ad types
declare var keypress: any; //todo ad types
declare var Handlebars: any; //todo ad types

declare var moment: momentT;

declare var Backbone: backboneT;

declare var numeral: numeralT;


declare var Localizer: {
    get(string): string,

    tryGet(string): string,

    resolveLocalizedText(string): string
};
