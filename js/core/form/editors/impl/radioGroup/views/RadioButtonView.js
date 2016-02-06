/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../../../libApi';
import template from '../templates/radioButton.hbs';

export default Marionette.ItemView.extend({

    template: template,

    className: 'l-radiobutton',

    focusElement: null,

    attributes: {
        'tabindex': '0'
    },

    initialize: function (options) {
        this.enabled = options.enabled;
    },

    ui: {
        toggleButton: '.js-toggle-button',
        displayText: '.js-display-text'
    },

    classes: {
        checked: 'pr-checked'
    },

    modelEvents: {
        'selected': '__toggle',
        'deselected': '__toggle'
    },

    events: {
        'click @ui.toggleButton': '__changeModelSelected',
        'click @ui.displayText': '__changeModelSelected'
    },

    onRender: function () {
        if (this.model.get('id') === this.options.selected) {
            this.model.select();
        }
    },

    __toggle: function () {
        this.$el.toggleClass(this.classes.checked, this.model.selected);
    },

    __changeModelSelected: function () {
        if (!this.enabled) {
            return;
        }
        this.model.select();
    },

    setEnabled: function (enabled) {
        this.enabled = enabled;
    }
});
