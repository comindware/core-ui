/**
 * Developer: Grigory Kuznetsov
 * Date: 10.09.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment } from '../../../../../libApi';
import { dateHelpers } from '../../../../../utils/utilsApi';
import template from '../templates/datePanel.hbs';

const defaultOptions = {
    pickerFormat: 'YYYY-MM-DD'
};

export default Marionette.ItemView.extend({
    template: template,

    initialize: function (options) {
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
            pickerFormattedDate = val ? moment(new Date(val)).format(format) : moment(new Date()).format(format);

        this.ui.pickerInput.attr('data-date', pickerFormattedDate);
        this.ui.pickerInput.datetimepicker('update');
    },

    updateValue: function (date) {
        var oldVal = this.model.get('value'),
            newVal = '';

        if (date === null || date === '') {
            newVal = null;
        } else if (oldVal) {
            var momentDate = moment(date);
            newVal = moment(oldVal).year(momentDate.year()).month(momentDate.month()).date(momentDate.date()).toString();
        } else {
            newVal = date;
        }

        this.model.set({value: newVal});
    },

    onShow: function () {
        this.ui.pickerInput.datetimepicker(this.pickerOptions)
            .on('changeDate', function (e) {
                var newValue = new Date(e.date.setMinutes(e.date.getMinutes() + e.date.getTimezoneOffset()));
                this.updateValue(newValue);
                this.trigger('close');
            }.bind(this));
        this.updatePickerDate();
    }
});
