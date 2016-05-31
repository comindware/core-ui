/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import template from '../templates/dropdownButton.hbs';

const classes = {
};

export default Marionette.ItemView.extend({
    initialize: function (options) {
        this.reqres = options.reqres;
    },

    className: 'input input_dropdown',

    template: template,

    attributes: {
        tabindex: 0
    },

    templateHelpers: function () {
        var value = this.model.get('value');
        var displayAttribute = this.model.get('displayAttribute');
        return {
            hasValue: Boolean(value),
            text: value ? _.result(value.toJSON(), displayAttribute) : null
        };
    },

    ui: {
        text: '.js-text'
    },

    events: {
        'click': '__click',
        'focus': '__onFocus'
    },

    modelEvents: {
        'change:value': 'render'
    },

    __click: function () {
        this.reqres.request('panel:open');
    },

    __onFocus: function () {
        this.trigger('focus');
    }
});
