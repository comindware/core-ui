/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import template from './templates/booleanEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';

const defaultOptions = {
    displayText: ''
};

/**
 * @name BooleanEditorView
 * @memberof module:core.form.editors
 * @class A simple Checkbox editor. Supported data type: <code>Boolean</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {String} [options.displayText] Text to the right of the checkbox. Click on text triggers the checkbox.
 * */
Backbone.Form.editors.Boolean = BaseItemEditorView.extend(/** @lends module:core.form.editors.BooleanEditorView.prototype */{
    initialize: function (options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }
    },

    ui: {
        toggleButton: '.js-toggle-button',
        displayText: '.js-display-text'
    },

    focusElement: null,

    events: {
        'click @ui.toggleButton': '__toggle',
        'click @ui.displayText': '__toggle'
    },

    className: 'editor editor_checkbox',

    attributes: {
        'tabindex': '0'
    },

    template: template,

    templateHelpers: function () {
        return {
            displayText: this.options.displayText
        };
    },

    __toggle: function () {
        if (!this.getEnabled() || this.getReadonly()) {
            return;
        }
        this.setValue(!this.getValue());
        this.__triggerChange();
    },

    __value: function (value, triggerChange) {
        this.__toggle();
    },

    onRender: function () {
        if (this.getValue()) {
            this.$el.addClass('editor_checked');
        }
    },

    setValue: function (value) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        if (this.value) {
            this.$el.addClass('editor_checked');
        } else {
            this.$el.removeClass('editor_checked');
        }
    }
});

export default Backbone.Form.editors.Boolean;
