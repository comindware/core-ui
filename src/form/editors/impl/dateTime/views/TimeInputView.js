/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars, moment } from '../../../../../libApi';
import { helpers, dateHelpers } from '../../../../../utils/utilsApi';
import template from '../templates/timeInput.hbs';
import LocalizationService from '../../../../../services/LocalizationService';

export default Marionette.ItemView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'timezoneOffset');
        helpers.ensureOption(options, 'allowEmptyValue');
        this.timeEditFormat = dateHelpers.getTimeEditFormat();
    },

    template: Handlebars.compile(template),

    ui: {
        'input': '.js-time-input'
    },

    className: 'time-view',

    events: {
        'click': '__onClick',
        'focus @ui.input': '__onFocus'
    },

    modelEvents: {
        'change:value': '__onValueChange',
        'change:readonly': '__onEnabledChange',
        'change:enabled': '__onEnabledChange'
    },

    endEditing: function () {
        let parsedValue = this.getParsedInputValue();
        this.model.set('value', parsedValue);
        this.__updateDisplayValue();
    },

    getParsedInputValue: function () {
        let val = this.ui.input.val();
        let currentValue = this.model.get('value');

        if (val === '') {
            if (this.options.allowEmptyValue) {
                return null;
            } else {
                return currentValue;
            }
        }

        let format = this.timeEditFormat,
            parsedVal = moment.utc(val, format, true),
            parsedDate;

        if (parsedVal.isValid()) {
            if (currentValue) {
                // Take previously selected date and new time
                parsedDate = moment.utc(currentValue).utcOffset(this.getOption('timezoneOffset'))
                    .hour(parsedVal.hour()).minute(parsedVal.minute()).second(0).millisecond(0).toISOString();
            } else {
                // Take current date and newly selected time
                parsedDate = moment.utc({}).hour(parsedVal.hour()).minute(parsedVal.minute() - this.getOption('timezoneOffset')).toISOString();
            }
        } else if (currentValue !== '' && currentValue !== null) {
            parsedDate = currentValue;
        } else {
            if (this.options.allowEmptyValue) {
                parsedDate = null;
            } else {
                parsedDate = currentValue;
            }
        }

        return parsedDate;
    },

    __onEnabledChange: function () {
        this.setPlaceholder();
        this.setInputPermissions();
    },

    setInputPermissions: function () {
        var enabled = this.model.get('enabled'),
            readonly = this.model.get('readonly');

        if (!enabled) {
            this.ui.input.prop('disabled', true);
        } else {
            this.ui.input.prop('disabled', false);
        }

        if (readonly) {
            this.ui.input.prop('readonly', true);
        } else {
            this.ui.input.prop('readonly', false);
        }
    },

    __onValueChange: function () {
        this.setPlaceholder();
        this.__updateDisplayValue();
    },

    onRender: function () {
        this.setPlaceholder();
        this.setInputPermissions();
        this.__updateDisplayValue();
    },

    __updateDisplayValue: function () {
        let value = this.model.get('value');
        let formattedValue;
        if (value === null || value === '') {
            formattedValue = '';
        } else {
            if (this.options.timeDisplayFormat) {
                formattedValue = moment.utc(value).utcOffset(this.getOption('timezoneOffset')).format(this.options.timeDisplayFormat);
            } else {
                formattedValue = dateHelpers.getDisplayTime(moment.utc(value).utcOffset(this.getOption('timezoneOffset')));
            }
        }
        this.ui.input.val(formattedValue);
    },

    setPlaceholder: function () {
        if (!this.model.get('enabled') || this.model.get('readonly')) {
            this.placeholder = '';
        } else {
            this.placeholder = LocalizationService.get('CORE.FORM.EDITORS.TIME.EMPTYPLACEHOLDER');
        }

        this.ui.input.prop('placeholder', this.placeholder);
    },

    startEditing: function () {
        var val = this.model.get('value'),
            format = this.timeEditFormat,
            editFormattedDate = val ? moment.utc(val).utcOffset(this.getOption('timezoneOffset')).format(format) : '';

        this.ui.input.val(editFormattedDate);
    },

    __onFocus: function () {
        this.trigger('focus');
    },

    __onClick: function () {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.trigger('calendar:open');
        }
    },

    focus: function () {
        this.ui.input.focus();
        this.trigger('focus');
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.trigger('calendar:open');
        }
    }
});
