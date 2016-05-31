/**
 * Developer: Grigory Kuznetsov
 * Date: 17.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment } from '../../libApi';
import template from './templates/timeEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import TimeView from './impl/dateTime/views/TimeView';

const defaultOptions = {
    allowEmptyValue: true
};

/**
 * @name TimeEditorView
 * @memberof module:core.form.editors
 * @class Редактор времени. Поддерживаемый тип данных: <code>String</code> в формате ISO8601
 * (например, '2015-07-20T10:46:37Z').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object.
 * All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowEmptyValue=true] - Whether to display a delete button that sets the value to <code>null</code>.
 * */
Backbone.Form.editors.Time = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.TimeEditorView.prototype */{
    initialize: function (options) {
        options = options || {};
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.timeModel = new Backbone.Model({
            value: this.value,
            enabled: this.getEnabled(),
            readonly: this.getReadonly()
        });
        this.listenTo(this.timeModel, 'change:value', this.__change, this);

        this.timeView = new TimeView({
            model: this.timeModel,
            allowEmptyValue: this.options.allowEmptyValue
        });
        this.listenTo(this.timeView, 'focus', this.onFocus);
        this.listenTo(this.timeView, 'blur', this.onBlur);
    },

    regions: {
        timeRegion: '.js-time-region'
    },

    className: 'editor editor_time',

    template: template,

    ui: {
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__onClear'
    },

    __change: function () {
        this.__value(this.timeModel.get('value'), true, true);
        this.__updateClearButton();
    },

    __onClear: function () {
        this.__value(null, true, true);
        this.timeModel.set('value', null);
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
        this.timeModel.set('value', value);
    },

    onRender: function () {
        this.timeRegion.show(this.timeView);
        this.__updateClearButton();
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

    getValue: function () {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    __setEnabled: function (enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.timeModel.set({enabled: this.getEnabled()});
    },

    __setReadonly: function (readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.timeModel.set({readonly: this.getReadonly()});
    },

    focusElement: null,

    /**
     * Sets the focus onto this editor.
     */
    focus: function() {
        if (this.hasFocus) {
            return;
        }
        this.timeView.focus();
    },

    /**
     * Clears the focus.
     */
    blur: function() {
        if (!this.hasFocus) {
            return;
        }
        this.timeView.blur();
    }
});

export default Backbone.Form.editors.Time;
