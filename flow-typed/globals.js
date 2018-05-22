/* eslint-disable */
import coreApi from '../src/coreApi';
import momentT from 'moment';
import Underscore from 'underscore';
import numeralT from 'numeral';
import backboneT from 'backbone';
import LocalizationService from '../src/services/LocalizationService';

declare var Handlebars: {
    compile: (template: string) => Function
};

declare var rangyinputs: any;

declare var Marionette: {
    View: any,
    CompositeView: any,
    CollectionView: any,
    Object: any,
    Behavior: any,
    Application: any
}; //todo ad types

declare var _: Underscore;

declare var Core: coreApi;

declare var moment: momentT;

declare var Backbone: backboneT;

declare var numeral: numeralT;

declare var Localizer: LocalizationService;

declare var Ajax: any;
