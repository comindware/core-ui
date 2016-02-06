/**
 * Developer: Ksenia Kartvelishvili
 * Date: 21.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import template from '../templates/bubble.hbs';

export default Marionette.ItemView.extend({
    initialize: function (options) {
        this.reqres = options.reqres;
    },

    template: template,

    templateHelpers: function () {
        return {
            enabled: this.options.enabled
        };
    },

    tagName: 'li',

    className: 'bubbles__i',

    events: {
        'click .js-bubble-delete': '__delete'
    },

    ui: {
        clearButton: '.js-bubble-delete'
    },

    __delete: function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.reqres.request('bubble:delete', this.model);
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
