/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import template from '../templates/dropdownButton.hbs';

const classes = {
};

export default Marionette.ItemView.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },

    className: 'input input_dropdown',

    template: Handlebars.compile(template),

    templateHelpers() {
        const value = this.model.get('value');
        const displayAttribute = this.model.get('displayAttribute');
        return {
            hasValue: Boolean(value),
            text: value ? _.result(value.toJSON(), displayAttribute) : null,
            allowEmptyValue: this.options.allowEmptyValue
        };
    },

    ui: {
        text: '.js-text'
    },

    events: {
        'click .js-clear-button': '__clear',
        click: '__click',
        focus: '__onFocus'
    },

    modelEvents: {
        'change:value': 'render'
    },

    __clear() {
        this.reqres.request('value:set', null);
        return false;
    },

    __click() {
        this.reqres.request('panel:open');
    },

    __onFocus() {
        this.trigger('focus');
    }
});
