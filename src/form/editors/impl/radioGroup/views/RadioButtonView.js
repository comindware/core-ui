/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from '../../../../../libApi';
import template from '../templates/radioButton.hbs';

export default Marionette.ItemView.extend({

    template: Handlebars.compile(template),

    className: 'editor editor_radiobutton',

    focusElement: null,

    attributes() {
        return {
            title: (this.model && this.model.get('title')) || null,
            tabindex: '0'
        }        
    },

    initialize: function (options) {
        this.enabled = options.enabled;
    },

    classes: {
        checked: 'editor_checked'
    },

    modelEvents: {
        'selected': '__toggle',
        'deselected': '__toggle'
    },

    events: {
        'click': '__changeModelSelected'
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
