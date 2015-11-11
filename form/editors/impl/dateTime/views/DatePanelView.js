/**
 * Developer: Grigory Kuznetsov
 * Date: 10.09.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib', 'core/utils/utilsApi', 'text!../templates/datePanel.html'],
    function (lib, utils, template) {
        'use strict';

        var defaultOptions = {
            pickerFormat: 'YYYY-MM-DD'
        };

        return Marionette.ItemView.extend({
            template: Handlebars.compile(template),

            initialize: function (options) {
                this.pickerOptions = {
                    minView: 2,
                    format: this.options.pickerFormat,
                    todayBtn: true,
                    weekStart: utils.dateHelpers.getWeekStartDay(),
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
                    pickerFormattedDate = val ? lib.moment(new Date(val)).format(format) : lib.moment(new Date()).format(format);

                this.ui.pickerInput.attr('data-date', pickerFormattedDate);
                this.ui.pickerInput.datetimepicker('update');
            },

            updateValue: function (date) {
                var oldVal = this.model.get('value'),
                    newVal = '';

                if (date === null || date === '') {
                    newVal = null;
                } else if (oldVal) {
                    var momentDate = lib.moment(date);
                    newVal = lib.moment(oldVal).year(momentDate.year()).month(momentDate.month()).date(momentDate.date()).toString();
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

    });
