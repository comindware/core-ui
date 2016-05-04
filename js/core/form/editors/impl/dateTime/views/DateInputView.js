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
        clearButton: '.js-date-remove',
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
        'click @ui.clearButton': '__onClear',
        'blur @ui.dateInput': '__onBlur'
    },

    __onEnabledChange: function () {
        this.setPlaceholder();
        this.setInputPermissions();
    },

    __onBlur: function () {
        this.isEditing = false;
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

        if (!enabled || readonly) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
    },

    __onClear: function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.model.set({value: null});
    },

    __change: function () {
        let parsedInputValue = this.getParsedInputValue();
        if (parsedInputValue != null) {
            this.updateValue(parsedInputValue);
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

    getParsedInputValue: function () {
        var val = this.ui.dateInput.val();

        if (val === '') {
            return null;
        }

        var format = this.editDateFormat,
            currentValue = this.model.get('value'),
            parsedVal = moment.utc(val, format, true),
            parsedDate;

        if (parsedVal.isValid()) {
            parsedDate = parsedVal.toDate();
        } else {
            parsedDate = null;
        }

        return parsedDate;
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
    },

    getFormattedDisplayValue: function () {
        return this.model.get('value') == null ? '' : dateHelpers.getDisplayDate(moment.utc(this.model.get('value')).utcOffset(this.getOption('timezoneOffset')));
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
    }
});
