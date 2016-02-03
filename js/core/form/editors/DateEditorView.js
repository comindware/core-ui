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
};

/**
 * @name DateEditorView
 * @memberof module:core.form.editors
 * @class Редактор даты: дропдаун с календарем. Поддерживаемый тип данных: <code>String</code> в формате ISO8601
 * (например, '2015-07-20T00:00:00Z').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Объект опций. Собственных опций нет. Поддерживаются все опции базового класса
 * {@link module:core.form.editors.base.BaseEditorView BaseEditorView}.
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
            model: this.dateModel
        });
    },

    regions: {
        dateRegion: '.js-date-region'
    },

    className: 'l-field l-field_date',

    template: template,

    templateHelpers: function () {
        return this.options;
    },

    __change: function () {
        this.__value(this.dateModel.get('value'), true, true);
    },

    setValue: function (value) {
        this.__value(value, true, false);
        this.dateModel.set('value', value);
    },

    onRender: function () {
        this.dateRegion.show(this.dateView);
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
    }
});

export default Backbone.Form.editors.Date;
