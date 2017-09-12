/**
 * Developer: Ksenia Kartvelishvili
 * Date: 30.08.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/bubbleItem.hbs';

export default Marionette.ItemView.extend({
    initialize(options) {
        this.reqres = options.reqres;

        this.url = this.model.attributes ? this.options.createValueUrl(this.model.attributes) : false;
    },

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            enabled: this.options.enabled,
            url: this.url
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

    __delete() {
        this.reqres.request('bubble:delete', this.model);
        return false;
    },

    __linkClick() {
        if (this.url) {
            window.location = this.url;
        }
        return false;
    },

    updateEnabled(enabled) {
        this.options.enabled = enabled;
        if (enabled) {
            this.ui.clearButton.show();
        } else {
            this.ui.clearButton.hide();
        }
    },

    onRender() {
        this.updateEnabled(this.options.enabled);
    }
});
