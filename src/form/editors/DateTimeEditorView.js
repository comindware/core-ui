/**
 * Developer: Grigory Kuznetsov
 * Date: 07/16/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars, moment, $ } from '../../libApi';
import template from './templates/dateTimeEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DateView from './impl/dateTime/views/DateView';
import TimeView from './impl/dateTime/views/TimeView';
import formRepository from '../formRepository';

const defaultOptions = {
    allowEmptyValue: true,
    timezoneOffset: -new Date().getTimezoneOffset(),
    dateDisplayFormat: null,
    timeDisplayFormat: null
};

/**
 * @name DateTimeEditorView
 * @memberof module:core.form.editors
 * @class Combined date and time editor. Supported data type: <code>String</code> in ISO8601 format
 * (for example, '2015-07-20T10:46:37Z').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object.
 * All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowEmptyValue=true] - Whether to display a delete button that sets the value to <code>null</code>.
 * @param {Number} options.timezoneOffset - Number of minutes representing timezone offset.
 * E.g. for UTC+3 enter <code>180</code>. Negative values allowed. Defaults to browser timezone offset.
 * @param {String} [options.dateDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'M/D/YYYY' etc.).
 * @param {String} [options.timeDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'LTS' etc.).
 * */
formRepository.editors.DateTime = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.DateTimeEditorView.prototype */{
    initialize: function(options) {
        options = options || {};
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        var readonly = this.getReadonly(),
            enabled = this.getEnabled();

        this.dateTimeModel = new Backbone.Model({
            value: this.value,
            readonly: readonly,
            enabled: enabled
        });

        this.listenTo(this.dateTimeModel, 'change:value', this.__change, this);
    },

    ui: {
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__onClear'
    },

    regions: {
        dateRegion: '.js-date-region',
        timeRegion: '.js-time-region'
    },

    className: 'editor editor_date-time',

    template: Handlebars.compile(template),

    templateHelpers: function () {
        return this.options;
    },

    __change: function () {
        this.__value(this.dateTimeModel.get('value'), true, true);
        this.__updateClearButton();
    },

    setValue: function (value) {
        this.__value(value, true, false);
        this.dateTimeModel.set('value', value);
    },

    getValue: function () {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    onRender: function () {
        this.dateView = new DateView({
            model: this.dateTimeModel,
            timezoneOffset: this.options.timezoneOffset,
            preserveTime: true,
            allowEmptyValue: this.options.allowEmptyValue,
            dateDisplayFormat: this.options.dateDisplayFormat
        });
        this.listenTo(this.dateView, 'focus', this.onFocus);
        this.listenTo(this.dateView, 'blur', this.onDateBlur);

        this.timeView = new TimeView({
            model: this.dateTimeModel,
            timezoneOffset: this.options.timezoneOffset,
            allowEmptyValue: this.options.allowEmptyValue,
            timeDisplayFormat: this.options.timeDisplayFormat
        });
        this.listenTo(this.timeView, 'focus', this.onFocus);
        this.listenTo(this.timeView, 'blur', this.onTimeBlur);

        this.dateRegion.show(this.dateView);
        this.timeRegion.show(this.timeView);
        this.__updateClearButton();
    },

    __updateClearButton: function() {
        if (!this.options.allowEmptyValue || !this.getValue()) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
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
        this.dateTimeModel.set({enabled: this.getEnabled()});
    },

    __setReadonly: function (readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.dateTimeModel.set({readonly: this.getReadonly()});
    },

    __onClear: function() {
        this.__value(null, true, true);
        this.dateTimeModel.set('value', null);
        return false;
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
        this.timeView.blur();
    },

    onFocus: function () {
        BaseLayoutEditorView.prototype.onFocus.call(this);
    },

    onDateBlur: function () {
        if (this.timeView.hasFocus()) {
            return;
        }
        this.onBlur();
    },

    onTimeBlur: function () {
        if (this.dateView.hasFocus()) {
            return;
        }
        this.onBlur();
    }
});

export default formRepository.editors.DateTime;
