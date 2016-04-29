/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment } from '../../../../../libApi';
import { helpers, dateHelpers } from '../../../../../utils/utilsApi';
import template from '../templates/timeInput.hbs';
import LocalizationService from '../../../../../services/LocalizationService';

export default Marionette.ItemView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'timezoneOffset');
        helpers.ensureOption(options, 'reqres');
        this.reqres = options.reqres;
        this.timeEditFormat = dateHelpers.getTimeEditFormat();
    },

    template: template,

    ui: {
        'input': '.js-time-input',
        'clearButton': '.js-time-remove'
    },

    className: 'dev-time-input-view',

    events: {
        'mousedown': '__onClick',
        'click @ui.clearButton': '__onClear',
        'change @ui.input': '__onInputChange',
        'blur @ui.input': '__onBlur'
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
        
        if (this.isEditing) {
            this.ui.input.val(this.getDisplayValue());
        } else {
            this.showEditFormattedTime();
        }
        
        this.reqres.request('panel:close');
    },

    getParsedInputValue: function () {
        var val = this.ui.input.val();

        if (val === '') {
            return null;
        }

        var format = this.timeEditFormat,
            currentValue = this.model.get('value'),
            parsedVal = moment.utc(val, format, true),
            parsedDate;

        if (parsedVal.isValid()) {
            parsedDate = currentValue ?
                moment.utc(currentValue).utcOffset(this.getOption('timezoneOffset')).hour(parsedVal.hour()).minute(parsedVal.minute()).second(0).millisecond(0).toISOString() :
                moment.utc({}).hour(parsedVal.hour()).minute(parsedVal.minute() - this.getOption('timezoneOffset')).toISOString();
        } else if (currentValue !== '' && currentValue !== null) {
            parsedDate = currentValue;
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
            formattedVal = dateHelpers.getDisplayTime(moment.utc(val).utcOffset(this.getOption('timezoneOffset')));
        }

        return formattedVal;
    },

    setPlaceholder: function () {
        if (!this.model.get('enabled') || this.model.get('readonly')) {
            this.placeholder = '';
        } else {
            this.placeholder = LocalizationService.get('CORE.FORM.EDITORS.TIME.EMPTYPLACEHOLDER');
        }

        this.ui.input.prop('placeholder', this.placeholder);
    },

    showEditFormattedTime: function () {
        var val = this.model.get('value'),
            format = this.timeEditFormat,
            editFormattedDate = val ? moment.utc(val).utcOffset(this.getOption('timezoneOffset')).format(format) : '';

        this.ui.input.val(editFormattedDate);
    },

    __onBlur: function () {
        this.isEditing = false;
    },

    __onClick: function () {
        if (this.isEditing || !this.model.get('enabled') || this.model.get('readonly')) {
            return;
        }

        this.showEditFormattedTime();
        this.reqres.request('panel:open');
        this.isEditing = true;
    }
});
