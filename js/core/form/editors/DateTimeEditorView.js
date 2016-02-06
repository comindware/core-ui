/**
 * Developer: Grigory Kuznetsov
 * Date: 07/16/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment } from '../../libApi';
import template from './templates/dateTimeEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DateView from './impl/dateTime/views/DateView';
import TimeView from './impl/dateTime/views/TimeView';

const defaultOptions = {
    enableDelete: false
};

/**
 * @name DateTimeEditorView
 * @memberof module:core.form.editors
 * @class Редактор даты и времени. Поддерживаемый тип данных: <code>String</code> в формате ISO8601
 * (например, '2015-07-20T10:46:37Z').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Объект опций. Собственных опций нет. Поддерживаются все опции базового класса
 * {@link module:core.form.editors.base.BaseEditorView BaseEditorView}.
 * */
Backbone.Form.editors.DateTime = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.DateTimeEditorView.prototype */{
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
        deleteButton: '.js-clear-button'
    },

    events: {
        'click @ui.deleteButton': '__onClear'
    },

    regions: {
        dateRegion: '.js-date-region',
        timeRegion: '.js-time-region'
    },

    className: 'l-field date-time',

    template: template,

    templateHelpers: function () {
        return this.options;
    },

    __change: function () {
        this.__value(this.dateTimeModel.get('value'), true, true);
        this.updateDelete();
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
            model: this.dateTimeModel
        });

        this.timeView = new TimeView({
            model: this.dateTimeModel
        });

        this.dateRegion.show(this.dateView);
        this.timeRegion.show(this.timeView);
        this.updateDelete();
    },

    updateDelete: function() {
        if (!this.options.enableDelete || !this.getValue()) {
            this.ui.deleteButton.hide();
        } else {
            this.ui.deleteButton.show();
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
    }
});

export default Backbone.Form.editors.DateTime;
