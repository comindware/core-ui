/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib', 'core/utils/utilsApi', 'text!../templates/date.html'],
    function (lib, utils, template) {
        'use strict';

        var defaultOptions = {
            emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER'),
            readonlyPlaceholder: Localizer.get('CORE.FORM.EDITORS.DATE.READONLYPLACEHOLDER'),
            disablePlaceholder: Localizer.get('CORE.FORM.EDITORS.DATE.DISABLEDPLACEHOLDER'),
            editDateFormat: 'MM/DD/YYYY',
            pickerFormat: 'YYYY-MM-DD'
        };

        return Marionette.ItemView.extend({
            initialize: function (options) {
                options = options || {};
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }
            },

            template: Handlebars.compile(template),

            className: 'date-view',

            ui: {
                clearButton: '.js-date-remove',
                pickerInput: '.js-picker-input',
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
                'click @ui.dateInput': '__handleClick',
                'change @ui.dateInput': '__change',
                'click @ui.clearButton': '__onClear'
            },

            __onEnabledChange: function () {
                this.setPlaceholder();
                this.setInputPermissions();
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
                this.updateValue(this.getParsedInputValue());
            },

            __handleClick: function () {
                if (!this.model.get('enabled') || this.model.get('readonly')) {
                    return;
                }

                this.showEditFormattedDate();
                this.showPicker();
            },

            showEditFormattedDate: function () {
                var val = this.model.get('value'),
                    format = this.options.editDateFormat,
                    editFormattedDate = val ? lib.moment(new Date(val)).format(format) : '';

                this.ui.dateInput.val(editFormattedDate);
            },

            getParsedInputValue: function () {
                var val = this.ui.dateInput.val();

                if (val === '') {
                    return null;
                }

                var format = this.options.editDateFormat,
                    currentValue = this.model.get('value'),
                    parsedVal = lib.moment(val, format, true),
                    parsedDate;

                if (parsedVal.isValid()) {
                    parsedDate = new Date(parsedVal);
                } else if (currentValue !== '' && currentValue !== null) {
                    parsedDate = new Date(currentValue);
                } else {
                    parsedDate = null;
                }

                return parsedDate;
            },

            showPicker: function () {
                var self = this,
                    mainRegionHeight = $('body').height(),
                    pickerTopOffset = this.ui.pickerInput.offset().top,
                    isTopPosition = mainRegionHeight - pickerTopOffset < 250;

                this.updatePickerDate();
                this.ui.pickerInput.datetimepicker({
                    autoclose: true,
                    minView: 2,
                    format: this.options.pickerFormat,
                    todayBtn: true,
                    pickerPosition: isTopPosition ? 'top-right' : 'bottom-right',
                    weekStart: utils.dateHelpers.getWeekStartDay(),
                    language: Context.langCode
                }).on('changeDate', function (e) {
                    var newValue = new Date(e.date.setMinutes(e.date.getMinutes() + e.date.getTimezoneOffset()));
                    this.updateValue(newValue);
                }.bind(this))
                    .on('hide', function (e) {
                        self.ui.pickerInput.off('changeDate');
                        self.ui.pickerInput.off('hide');
                        $(this).datetimepicker('remove');
                        self.updateValue(self.getParsedInputValue());
                    });

                this.ui.pickerInput.datetimepicker('show');
            },

            updatePickerDate: function () {
                var val = this.model.get('value'),
                    format = this.options.pickerFormat,
                    pickerFormattedDate = val ? lib.moment(new Date(val)).format(format) : lib.moment(new Date()).format(format);

                this.ui.pickerInput.val(pickerFormattedDate);
            },

            onRender: function () {
                this.setPlaceholder();
                this.setInputPermissions();
                this.updateDisplayValue();
            },

            setPlaceholder: function () {
                if (!this.model.get('enabled')) {
                    this.placeholder = this.options.disablePlaceholder;
                } else if (this.model.get('readonly')) {
                    this.placeholder = this.options.readonlyPlaceholder;
                } else {
                    this.placeholder = this.options.emptyPlaceholder;
                }

                this.ui.dateInput.prop('placeholder', this.placeholder);
            },

            updateDisplayValue: function () {
                this.ui.dateInput.val(this.getFormattedDisplayValue());
            },

            getFormattedDisplayValue: function () {
                return utils.dateHelpers.getDisplayDate(this.model.get('value'));
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
                this.updateDisplayValue();
            }
        });
    });
