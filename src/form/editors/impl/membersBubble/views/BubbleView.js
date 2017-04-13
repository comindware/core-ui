/**
 * Developer: Ksenia Kartvelishvili
 * Date: 21.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from 'lib';
import template from '../templates/bubble.hbs';

export default Marionette.ItemView.extend({
    initialize: function (options) {
        this.reqres = options.reqres;
    },

    template: Handlebars.compile(template),

    templateHelpers: function () {
        return {
            enabled: this.options.enabled
        };
    },

    tagName: 'li',

    className: 'bubbles__i',

    events: {
        'click .js-bubble-delete': '__delete',
        'click .js-bubble-link': '__linkClick'
    },

    ui: {
        clearButton: '.js-bubble-delete'
    },

    __delete: function(e) {
        this.reqres.request('bubble:delete', this.model);
        return false;
    },

    __linkClick: function () {
        window.location = this.model.get('url');
        return false;
    },

    updateEnabled: function (enabled) {
        this.options.enabled = enabled;
        if (enabled) {
            this.ui.clearButton.show();
        } else {
            this.ui.clearButton.hide();
        }
    },

    onRender: function () {
        this.updateEnabled(this.options.enabled);
    }
});
