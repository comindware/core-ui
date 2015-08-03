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

define(['module/lib', 'core/utils/utilsApi', 'text!../templates/timeInput.html'],
    function (lib, utils, template) {
        'use strict';
        return Marionette.ItemView.extend({

            emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.TIME.EMPTYPLACEHOLDER'),
            readonlyPlaceholder: Localizer.get('CORE.FORM.EDITORS.TIME.READONLYPLACEHOLDER'),
            disabledPlaceholder: Localizer.get('CORE.FORM.EDITORS.TIME.DISABLEDPLACEHOLDER'),

            initialize: function (options) {
                this.reqres = options.reqres;
                this.timeEditFormat = utils.dateHelpers.getTimeEditFormat();
            },

            template: Handlebars.compile(template),

            ui: {
                'input': '.js-time-input',
                'clearButton': '.js-time-remove'
            },

            className: 'dev-time-input-view',

            events: {
                'click': '__onClick',
                'click @ui.clearButton': '__onClear',
                'change @ui.input': '__onInputChange'
            },

            modelEvents: {
                'change:value': '__onValueChange',
                'change:readonly': '__onEnabledChange',
                'change:enabled': '__onEnabledChange'
            },

            __onClear: function (e) {
                e.preventDefault();
                e.stopPropagation();

                this.model.set({value: null});
            },

            __onInputChange: function () {
                this.model.set({value: this.getParsedInputValue()});
                this.reqres.request('panel:close');
            },

            getParsedInputValue: function () {
                var val = this.ui.input.val();

                if (val === '') {
                    return null;
                }

                var format = this.timeEditFormat,
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

                if (!enabled || readonly) {
                    this.ui.clearButton.hide();
                } else {
                    this.ui.clearButton.show();
                }
            },

            __onValueChange: function () {
                this.setPlaceholder();
                this.ui.input.val(this.getDisplayValue());
            },

            onRender: function () {
                this.setPlaceholder();
                this.setInputPermissions();

                this.ui.input.val(this.getDisplayValue());
            },

            getDisplayValue: function () {
                var val = this.model.get('value'),
                    formattedVal;

                if (val === null || val === '') {
                    formattedVal = '';
                } else {
                    formattedVal = utils.dateHelpers.getDisplayTime(lib.moment(val));
                }

                return formattedVal;
            },

            setPlaceholder: function () {
                if (!this.model.get('enabled')) {
                    this.placeholder = this.disabledPlaceholder;
                } else if (this.model.get('readonly')) {
                    this.placeholder = this.readonlyPlaceholder;
                } else {
                    this.placeholder = this.emptyPlaceholder;
                }

                this.ui.input.prop('placeholder', this.placeholder);
            },

            showEditFormattedTime: function () {
                var val = this.model.get('value'),
                    format = this.timeEditFormat,
                    editFormattedDate = val ? lib.moment(new Date(val)).format(format) : '';

                this.ui.input.val(editFormattedDate);
            },

            __onClick: function () {
                if (!this.model.get('enabled') || this.model.get('readonly')) {
                    return;
                }
                
                this.showEditFormattedTime();
                this.reqres.request('panel:open');
            }
        });
    });
