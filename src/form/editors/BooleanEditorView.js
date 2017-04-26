/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from 'lib';
import template from './templates/booleanEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';

const defaultOptions = {
    displayText: ''
};

const classes = {
    CHECKED: 'editor_checked',
    UNDEFINED: 'editor_check_undefined'
};

/**
 * @name BooleanEditorView
 * @memberof module:core.form.editors
 * @class A simple Checkbox editor. Supported data type: <code>Boolean</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {String} [options.displayText] Text to the right of the checkbox. Click on text triggers the checkbox.
 * @param {String} [options.displayHtml] HTML content to the right of the checkbox. Click on it triggers the checkbox.
 * @param {String} [options.title] Title attribute for the editor.
 * */
formRepository.editors.Boolean = BaseItemEditorView.extend(/** @lends module:core.form.editors.BooleanEditorView.prototype */{
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

    attributes() {
        return {
            title: this.options.title || null,
            tabindex: '0'
        }
    },

    template: Handlebars.compile(template),

    templateHelpers: function () {
        return {
            displayText: this.options.displayText,
            displayHtml: this.options.displayHtml
        };
    },

    __toggle: function () {
        if (!this.getEnabled() || this.getReadonly()) {
            return false;
        }
        this.setValue(!this.getValue());
        this.__triggerChange();
        return false;
    },

    onRender: function () {
        if (this.getValue()) {
            this.$el.addClass(classes.CHECKED);
        }
    },

    setValue: function (value) {
        this.value = value;
        if (this.value) {
            this.$el.addClass(classes.CHECKED);
            this.$el.removeClass(classes.UNDEFINED);
        } else if (this.value === false) {
            this.$el.removeClass(classes.UNDEFINED);
            this.$el.removeClass(classes.CHECKED);
        } else {
            this.$el.removeClass(classes.CHECKED);
            this.$el.addClass(classes.UNDEFINED);
        }
    },

    isEmptyValue: function () {
        return !_.isBoolean(this.getValue());
    }
}, {
    classes
});

export default formRepository.editors.Boolean;
