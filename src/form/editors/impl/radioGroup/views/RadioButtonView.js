/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/radioButton.hbs';

export default Marionette.ItemView.extend({

    template: Handlebars.compile(template),

    className: 'editor editor_radiobutton',

    focusElement: null,

    attributes() {
        return {
            title: (this.model && this.model.get('title')) || null
        };
    },

    initialize(options) {
        this.enabled = options.enabled;
    },

    classes: {
        checked: 'editor_checked'
    },

    modelEvents: {
        selected: '__toggle',
        deselected: '__toggle'
    },

    events: {
        click: '__changeModelSelected'
    },

    onRender() {
        if (this.model.get('id') === this.options.selected) {
            this.model.select();
        }
    },

    __toggle() {
        this.$el.toggleClass(this.classes.checked, this.model.selected);
    },

    __changeModelSelected() {
        if (!this.enabled) {
            return;
        }
        this.model.select();
    },

    setEnabled(enabled) {
        this.enabled = enabled;
    }
});
