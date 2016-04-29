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
import template from '../templates/datePanel.hbs';

const defaultOptions = {
    pickerFormat: 'YYYY-MM-DD'
};

export default Marionette.ItemView.extend({
    template: template,

    initialize: function (options) {
        helpers.ensureOption(options, 'timezoneOffset');
        
        this.pickerOptions = {
            minView: 2,
            format: this.options.pickerFormat,
            todayBtn: true,
            weekStart: dateHelpers.getWeekStartDay(),
            language: window.langCode
        };
    },

    className: 'datepicker_panel',

    modelEvents: {
        'change:value': 'updatePickerDate'
    },

    ui: {
        pickerInput: '.js-datetimepicker'
    },

    updatePickerDate: function () {
        var val = this.model.get('value'),
            format = defaultOptions.pickerFormat,
            pickerFormattedDate = val ? moment.utc(new Date(val)).utcOffset(this.getOption('timezoneOffset')).format(format) : moment.utc({}).format(format);

        this.ui.pickerInput.attr('data-date', pickerFormattedDate);
        this.ui.pickerInput.datetimepicker('update');
    },

    updateValue: function (date) {
        var oldVal = this.model.get('value'),
            newVal = null;

        if (date === null || date === '') {
            newVal = null;
        } else if (oldVal) {
            let momentOldVal = moment.utc(oldVal);
            let momentOldPickerDate = moment(this.ui.pickerInput.attr('data-date'), defaultOptions.pickerFormat);
            let diff = moment(date).diff(momentOldPickerDate, 'days');
            newVal = momentOldVal.date(momentOldVal.date() + (diff || 0)).toISOString();
        } else {
            newVal = moment.utc({
                year: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate()
            }).minute(-this.getOption('timezoneOffset')).toISOString();
        }

        this.model.set({value: newVal});
    },

    onShow: function () {
        this.ui.pickerInput.datetimepicker(this.pickerOptions)
            .on('changeDate', function (e) {
                this.updateValue(e.date);
                this.trigger('close');
            }.bind(this));
        this.updatePickerDate();
    }
});
