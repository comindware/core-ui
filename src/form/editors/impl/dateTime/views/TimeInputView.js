/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars, moment } from 'lib';
import { helpers, dateHelpers } from 'utils';
import template from '../templates/timeInput.hbs';
import DateTimeService from '../../../services/DateTimeService';
import LocalizationService from '../../../../../services/LocalizationService';

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'allowEmptyValue');
        this.hasSeconds = this.__hasSeconds(options.timeDisplayFormat);
        this.timeEditFormat = dateHelpers.getTimeEditFormat(this.hasSeconds);
    },

    template: Handlebars.compile(template),

    ui: {
        input: '.js-time-input'
    },

    className: 'time-view',

    events: {
        click: '__onClick',
        'focus @ui.input': '__onFocus'
    },

    modelEvents: {
        'change:value': '__onValueChange',
        'change:readonly': '__onEnabledChange',
        'change:enabled': '__onEnabledChange'
    },

    endEditing() {
        const parsedValue = this.getParsedInputValue();
        this.model.set('value', parsedValue);
        this.__updateDisplayValue();
    },

    getParsedInputValue() {
        const val = this.ui.input.val();
        const currentValue = this.model.get('value');

        if (val === '') {
            if (this.options.allowEmptyValue) {
                return null;
            }
            return currentValue;
        }

        const format = this.timeEditFormat;
        const parsedVal = moment.utc(val, format, true);
        let parsedDate;

        if (parsedVal.isValid()) {
            if (currentValue) {
                // Take previously selected date and new time
                parsedDate = moment(currentValue)
                    .hour(parsedVal.hour()).minute(parsedVal.minute())
                    .second(this.hasSeconds ? parsedVal.second() : 0)
                    .millisecond(0)
                    .toISOString();
            } else {
                // Take current date and newly selected time
                parsedDate = moment
                    .hour(parsedVal.hour())
                    .second(this.hasSeconds ? parsedVal.second() : 0)
                    .toISOString();
            }
        } else if (currentValue !== '' && currentValue !== null) {
            parsedDate = currentValue;
        } else if (this.options.allowEmptyValue) {
            parsedDate = null;
        } else {
            parsedDate = currentValue;
        }

        return parsedDate;
    },

    __onEnabledChange() {
        this.setPlaceholder();
        this.setInputPermissions();
    },

    setInputPermissions() {
        const enabled = this.model.get('enabled');
        const readonly = this.model.get('readonly');

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

    __onValueChange() {
        this.setPlaceholder();
        this.__updateDisplayValue();
    },

    onRender() {
        this.setPlaceholder();
        this.setInputPermissions();
        this.__updateDisplayValue();
    },

    __updateDisplayValue() {
        const displayValue = DateTimeService.getTimeDisplayValue(this.model.get('value'), this.options.timeDisplayFormat);
        this.ui.input.val(displayValue);
        if (this.getOption('showTitle')) {
            this.$el.prop('title', displayValue);
        }
    },

    setPlaceholder() {
        if (!this.model.get('enabled') || this.model.get('readonly')) {
            this.placeholder = '';
        } else {
            this.placeholder = LocalizationService.get('CORE.FORM.EDITORS.TIME.EMPTYPLACEHOLDER');
        }

        this.ui.input.prop('placeholder', this.placeholder);
    },

    startEditing() {
        const val = this.model.get('value');
        const format = this.timeEditFormat;
        const editFormattedDate = val ? moment(val).format(format) : '';

        this.ui.input.val(editFormattedDate);
    },

    __onFocus() {
        this.trigger('focus');
    },

    __onClick() {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.trigger('calendar:open');
        }
    },

    focus() {
        this.ui.input.focus();
        this.trigger('focus');
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.trigger('calendar:open');
        }
    },

    __hasSeconds(format) {
        switch (format) {
            case 'LTS':
            case 'HH:mm:ss':
                return true;
            case 'LT':
            default:
                return false;
        }
    }
});
