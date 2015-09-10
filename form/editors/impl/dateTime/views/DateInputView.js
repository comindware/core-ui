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

define(['module/lib',
        'core/utils/utilsApi',
        'core/services/LocalizationService',
        'text!../templates/dateInput.html',
        '../../../../../dropdown/dropdownApi'
    ],
    function (lib, utils, LocalizationService, template, dropdownApi) {
        'use strict';

        var defaultOptions = {
            emptyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER')
        };

        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.editDateFormat = utils.dateHelpers.getDateEditFormat();
            },

            template: Handlebars.compile(template),

            behaviors: {
                CustomAnchorBehavior: {
                    behaviorClass: dropdownApi.views.behaviors.CustomAnchorBehavior,
                    anchor: '.js-anchor'
                }
            },

            className: 'date-view js-anchor',

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
                'click @ui.dateInput': '__handleClick',
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
                this.updateValue(this.getParsedInputValue());
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
                    editFormattedDate = val ? lib.moment(new Date(val)).format(format) : '';

                this.ui.dateInput.val(editFormattedDate);
            },

            getParsedInputValue: function () {
                var val = this.ui.dateInput.val();

                if (val === '') {
                    return null;
                }

                var format = this.editDateFormat,
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

            onRender: function () {
                this.setPlaceholder();
                this.setInputPermissions();
                this.updateDisplayValue();
            },

            setPlaceholder: function () {
                if (!this.model.get('enabled') || this.model.get('readonly')) {
                    this.placeholder = '';
                } else {
                    this.placeholder = defaultOptions.emptyPlaceholder;
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
            }
        });
    });
