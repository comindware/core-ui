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
        const value = this.model.attributes;
        return {
            enabled: this.options.enabled,
            url: this.url,
            text: this.options.getDisplayText(value),
            showEditButton: this.options.showEditButton && Boolean(value)
        };
    },

    tagName: 'li',

    className: 'bubbles__i',

    events: {
        'click @ui.clearButton': '__delete',
        'click @ui.editButton': '__edit',
        'click .js-bubble-link': '__linkClick'
    },

    ui: {
        clearButton: '.js-bubble-delete',
        editButton: '.js-edit-button'
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

    __edit() {
        if (this.reqres.request('value:edit', this.model.attributes)) {
            return false;
        }
        return null;
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
