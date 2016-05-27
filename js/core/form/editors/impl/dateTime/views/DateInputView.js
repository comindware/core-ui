/**
 * Developer: Grigory Kuznetsov
 * Date: 10.09.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment } from '../../../../../libApi';
import { helpers, dateHelpers } from '../../../../../utils/utilsApi';
import LocalizationService from '../../../../../services/LocalizationService';
import template from '../templates/dateInput.hbs';
import dropdownApi from '../../../../../dropdown/dropdownApi';

export default Marionette.ItemView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'timezoneOffset');
        helpers.ensureOption(options, 'allowEmptyValue');
        this.editDateFormat = dateHelpers.getDateEditFormat();
    },

    template: template,

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdownApi.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor'
        }
    },

    className: 'date-view',

    ui: {
        dateInput: '.js-date-input'
    },

    modelEvents: {
        'change:value': '__onValueChanged',
        'change:readonly': '__onEnabledChange',
        'change:enabled': '__onEnabledChange'
    },

    __onValueChanged: function () {
        this.updateDisplayValue();
    },

    events: {
        'mousedown @ui.dateInput': '__handleClick',
        'change @ui.dateInput': '__change',
        'focus @ui.dateInput': '__onFocus',
        'blur @ui.dateInput': '__onBlur'
    },

    __onEnabledChange: function () {
        this.setPlaceholder();
        this.setInputPermissions();
    },

    __onBlur: function () {
        if (!this.isEditing) {
            return;
        }
        this.isEditing = false;
        this.trigger('blur');
    },

    setInputPermissions: function () {
        var enabled = this.model.get('enabled'),
            readonly = this.model.get('readonly');

        if (!enabled) {
            this.ui.dateInput.prop('disabled', true);
        } else {
            this.ui.dateInput.prop('disabled', false);
        }

        if (readonly) {
            this.ui.dateInput.prop('readonly', true);
        } else {
            this.ui.dateInput.prop('readonly', false);
        }
    },

    __change: function () {
        let parsedInputValue = this.__getParsedInputValue();
        let inputIsEmpty = parsedInputValue === null;
        if (inputIsEmpty) {
            if (this.options.allowEmptyValue) {
                this.updateValue(null);
            } else {
                this.updateDisplayValue();
            }
        } else if (parsedInputValue.isValid()) {
            this.updateValue(parsedInputValue.toDate());
        } else {
            this.updateDisplayValue();
        }
        this.trigger('close');
    },

    __handleClick: function () {
        if (this.isEditing || !this.model.get('enabled') || this.model.get('readonly')) {
            return;
        }

        this.showEditFormattedDate();
        this.isEditing = true;
        this.trigger('open');
    },

    showEditFormattedDate: function () {
        var val = this.model.get('value'),
            format = this.editDateFormat,
            editFormattedDate = val ? moment.utc(val).utcOffset(this.getOption('timezoneOffset')).format(format) : '';

        this.ui.dateInput.val(editFormattedDate);
    },

    __getParsedInputValue: function () {
        let value = this.ui.dateInput.val();
        if (value === '') {
            return null;
        }
        return moment.utc(value, this.editDateFormat, true);
    },

    onRender: function () {
        this.setPlaceholder();
        this.setInputPermissions();
        this.updateDisplayValue();
    },

    setPlaceholder: function () {
        if (!this.model.get('enabled') || this.model.get('readonly')) {
            this.placeholder = '';
        } else {
            this.placeholder = LocalizationService.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER');
        }

        this.ui.dateInput.prop('placeholder', this.placeholder);
    },

    updateDisplayValue: function () {
        this.ui.dateInput.val(this.getFormattedDisplayValue());
        this.ui.dateInput.blur();
        this.__onBlur();
    },

    getFormattedDisplayValue: function () {
        return this.model.get('value') === null ? '' : dateHelpers.getDisplayDate(moment.utc(this.model.get('value')).utcOffset(this.getOption('timezoneOffset')));
    },

    updateValue: function (date) {
        var oldVal = this.model.get('value'),
            newVal = null;

        if (date === null || date === '') {
            newVal = null;
        } else if (oldVal && this.getOption('preserveTime')) {
            let momentOldVal = moment.utc(oldVal);
            let momentOldDisplayedDate = moment.utc(oldVal).utcOffset(this.getOption('timezoneOffset'));
            momentOldDisplayedDate = moment.utc({
                year: momentOldDisplayedDate.year(),
                month: momentOldDisplayedDate.month(),
                date: momentOldDisplayedDate.date()
            });
            let diff = moment.utc(date).diff(momentOldDisplayedDate, 'days');               // Figure out number of days between displayed old date and entered new date
            newVal = momentOldVal.date(momentOldVal.date() + (diff || 0)).toISOString();    // and apply it to stored old date to prevent transition-through-the-day bugs
        } else {
            newVal = moment.utc({
                year: date.getUTCFullYear(),
                month: date.getUTCMonth(),
                date: date.getUTCDate()
            }).minute(-this.getOption('timezoneOffset')).toISOString();
        }

        this.model.set({value: newVal});
    },

    __onFocus: function () {
        this.trigger('focus');
    },

    focus: function () {
        this.__handleClick();
        this.ui.dateInput.focus();
    },

    blur: function () {
        this.ui.dateInput.blur();
        this.__onBlur();
    }
});
