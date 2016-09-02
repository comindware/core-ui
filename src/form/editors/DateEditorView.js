/**
 * Developer: Grigory Kuznetsov
 * Date: 07/15/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment } from '../../libApi';
import template from './templates/dateEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DateView from './impl/dateTime/views/DateView';

const defaultOptions = {
    allowEmptyValue: true,
    displayDateFormat: null
};

/**
 * @name DateEditorView
 * @memberof module:core.form.editors
 * @class Calendar editor. The calendar opens in dropdown panel. Supported data type: <code>String</code> in ISO8601 format
 * (for example, '2015-07-20T00:00:00Z').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object.
 * All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowEmptyValue=true] - Whether to display a delete button that sets the value to <code>null</code>.
 * */
Backbone.Form.editors.Date = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.DateEditorView.prototype */{
    initialize: function (options) {
        options = options || {};
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.dateModel = new Backbone.Model({
            value: this.value,
            enabled: this.getEnabled(),
            readonly: this.getReadonly()
        });
        this.listenTo(this.dateModel, 'change:value', this.__change, this);

        this.dateView = new DateView({
            model: this.dateModel,
            allowEmptyValue: this.options.allowEmptyValue,
            displayDateFormat: this.options.displayDateFormat
        });
        this.listenTo(this.dateView, 'focus', this.onFocus);
        this.listenTo(this.dateView, 'blur', this.onBlur);
    },

    regions: {
        dateRegion: '.js-date-region'
    },

    className: 'editor editor_date',

    template: template,

    ui: {
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__onClear'
    },

    __change: function () {
        this.__value(this.dateModel.get('value'), true, true);
        this.__updateClearButton();
    },

    __onClear: function () {
        this.__value(null, true, true);
        this.dateModel.set('value', null);
        return false;
    },

    __updateClearButton: function() {
        if (!this.options.allowEmptyValue || !this.getValue()) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
    },

    setValue: function (value) {
        this.__value(value, true, false);
        this.dateModel.set('value', value);
    },

    onRender: function () {
        this.dateRegion.show(this.dateView);
        this.__updateClearButton();
    },

    getValue: function () {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    __value: function (value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __setEnabled: function (enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.dateModel.set({enabled: this.getEnabled()});
    },

    __setReadonly: function (readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.dateModel.set({readonly: this.getReadonly()});
    },

    focusElement: null,

    /**
     * Sets the focus onto this editor.
     */
    focus: function() {
        if (this.hasFocus) {
            return;
        }
        this.dateView.focus();
    },

    /**
     * Clears the focus.
     */
    blur: function() {
        if (!this.hasFocus) {
            return;
        }
        this.dateView.blur();
    }
});

export default Backbone.Form.editors.Date;
