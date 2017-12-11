/**
 * Developer: Grigory Kuznetsov
 * Date: 07/16/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars, moment } from 'lib';
import template from './templates/dateTimeEditor.hbs';
import DateTimeService from './services/DateTimeService';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DateView from './impl/dateTime/views/DateView';
import TimeView from './impl/dateTime/views/TimeView';
import formRepository from '../formRepository';

const defaultOptions = {
    allowEmptyValue: true,
    dateDisplayFormat: undefined,
    timeDisplayFormat: undefined,
    showTitle: true
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
 * E.g. for UTC+3 enter <code>180</code>. Negative values allowed. Defaults to browser timezone offset.
 * @param {String} [options.dateDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'M/D/YYYY' etc.).
 * @param {String} [options.timeDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'LTS' etc.).
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */
formRepository.editors.DateTime = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.DateTimeEditorView.prototype */{
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        const readonly = this.getReadonly();
        const enabled = this.getEnabled();

        this.value = this.__adjustValue(this.value);

        this.dateTimeModel = new Backbone.Model({
            value: this.value,
            readonly,
            enabled
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

    templateHelpers() {
        return this.options;
    },

    __change() {
        this.__value(this.dateTimeModel.get('value'), true, true);
        if (!this.isDestroyed) {
            this.__updateClearButton();
        }
    },

    setValue(value) {
        this.__value(value, true, false);
        this.dateTimeModel.set('value', value);
    },

    getValue() {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    onRender() {
        this.dateView = new DateView({
            model: this.dateTimeModel,
            preserveTime: true,
            allowEmptyValue: this.options.allowEmptyValue,
            dateDisplayFormat: this.options.dateDisplayFormat,
            showTitle: false
        });
        this.listenTo(this.dateView, 'focus', this.onFocus);
        this.listenTo(this.dateView, 'blur', this.onDateBlur);

        this.timeView = new TimeView({
            model: this.dateTimeModel,
            allowEmptyValue: this.options.allowEmptyValue,
            timeDisplayFormat: this.options.timeDisplayFormat,
            showTitle: false
        });
        this.listenTo(this.timeView, 'focus', this.onFocus);
        this.listenTo(this.timeView, 'blur', this.onTimeBlur);

        this.dateRegion.show(this.dateView);
        this.timeRegion.show(this.timeView);
        this.__updateClearButton();
        if (this.options.showTitle) {
            this.__updateTitle();
        }
    },

    __updateClearButton() {
        if (!this.options.allowEmptyValue || !this.getValue()) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
    },

    __value(newValue, updateUi, triggerChange) {
        const value = this.__adjustValue(newValue);
        if (this.value === value) {
            return;
        }
        this.value = value;
        if (this.options.showTitle) {
            this.__updateTitle();
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __setEnabled(enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.dateTimeModel.set({ enabled: this.getEnabled() });
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.dateTimeModel.set({ readonly: this.getReadonly() });
    },

    __onClear() {
        this.__value(null, true, true);
        this.dateTimeModel.set('value', null);
        this.focus();
        return false;
    },

    focusElement: null,

    /**
     * Sets the focus onto this editor.
     */
    focus() {
        if (this.hasFocus) {
            return;
        }
        this.dateView.focus();
    },

    /**
     * Clears the focus.
     */
    blur() {
        if (!this.hasFocus) {
            return;
        }
        this.dateView.blur();
        this.timeView.blur();
    },

    onFocus() {
        BaseLayoutEditorView.prototype.onFocus.call(this);
    },

    onDateBlur() {
        if (this.timeView.hasFocus()) {
            return;
        }
        this.onBlur();
    },

    onTimeBlur() {
        if (this.dateView.hasFocus()) {
            return;
        }
        this.onBlur();
    },

    __adjustValue(value) {
        return value === null ? value : moment(value).toISOString();
    },

    __updateTitle() {
        const dateDisplayValue = DateTimeService.getDateDisplayValue(this.getValue(), this.options.dateDisplayFormat);
        const timeDisplayValue = DateTimeService.getTimeDisplayValue(this.getValue(), this.options.timeDisplayFormat);
        const resultValue = `${dateDisplayValue} ${timeDisplayValue}`;
        this.$el.prop('title', resultValue);
    }
});

export default formRepository.editors.DateTime;
