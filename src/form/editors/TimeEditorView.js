/**
 * Developer: Grigory Kuznetsov
 * Date: 17.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars, moment } from 'lib';
import template from './templates/timeEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import TimeView from './impl/dateTime/views/TimeView';
import formRepository from '../formRepository';

const defaultOptions = {
    allowEmptyValue: true,
    timeDisplayFormat: null
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
 * @param {String} [options.timeDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'LTS' etc.).
 * */
formRepository.editors.Time = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.TimeEditorView.prototype */{
    initialize(options) {
        options = options || {};
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.value = this.__adjustValue(this.value);

        this.timeModel = new Backbone.Model({
            value: this.value,
            enabled: this.getEnabled(),
            readonly: this.getReadonly()
        });
        this.listenTo(this.timeModel, 'change:value', this.__change, this);

        this.timeView = new TimeView({
            model: this.timeModel,
            allowEmptyValue: this.options.allowEmptyValue,
            timeDisplayFormat: this.options.timeDisplayFormat
        });
        this.listenTo(this.timeView, 'focus', this.onFocus);
        this.listenTo(this.timeView, 'blur', this.onBlur);
    },

    regions: {
        timeRegion: '.js-time-region'
    },

    className: 'editor editor_time',

    template: Handlebars.compile(template),

    ui: {
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__onClear'
    },

    __change() {
        this.__value(this.timeModel.get('value'), true, true);
        this.__updateClearButton();
    },

    __onClear() {
        this.__value(null, true, true);
        this.timeModel.set('value', null);
        this.focus();
        return false;
    },

    __updateClearButton() {
        if (!this.options.allowEmptyValue || !this.getValue()) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
    },

    setValue(value) {
        this.__value(value, true, false);
        this.timeModel.set('value', value);
    },

    onRender() {
        this.timeRegion.show(this.timeView);
        this.__updateClearButton();
    },

    __value(value, updateUi, triggerChange) {
        value = this.__adjustValue(value);
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    getValue() {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    __setEnabled(enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.timeModel.set({ enabled: this.getEnabled() });
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.timeModel.set({ readonly: this.getReadonly() });
    },

    focusElement: null,

    /**
     * Sets the focus onto this editor.
     */
    focus() {
        if (this.hasFocus) {
            return;
        }
        this.timeView.focus();
    },

    /**
     * Clears the focus.
     */
    blur() {
        if (!this.hasFocus) {
            return;
        }
        this.timeView.blur();
    },

    __adjustValue(value) {
        return value === null ? value : moment(value).toISOString();
    }
});

export default formRepository.editors.Time;
