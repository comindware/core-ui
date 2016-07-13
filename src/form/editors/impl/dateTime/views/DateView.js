/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import template from '../templates/date.hbs';
import dropdownApi from '../../../../../dropdown/dropdownApi';
import PanelView from './DatePanelView';
import InputView from './DateInputView';

export default Marionette.LayoutView.extend({
    initialize: function () {
        this.timezoneOffset = this.getOption('timezoneOffset') || 0;
        this.preserveTime = !!this.getOption('preserveTime'); // If false (default), drop time components on date change
        this.allowEmptyValue = this.getOption('allowEmptyValue');
    },

    template: template,

    className: 'date-view',

    regions: {
        popoutRegion: '.js-popout-region'
    },

    onShow: function () {
        this.calendarDropdownView = dropdownApi.factory.createDropdown({
            buttonView: InputView,
            buttonViewOptions: {
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.allowEmptyValue
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.allowEmptyValue
            },
            renderAfterClose: false,
            autoOpen: false
        });
        this.listenTo(this.calendarDropdownView, 'before:close', this.__onBeforeClose, this);
        this.listenTo(this.calendarDropdownView, 'open', this.__onOpen, this);

        this.listenTo(this.calendarDropdownView, 'button:focus', this.__onButtonFocus, this);
        this.listenTo(this.calendarDropdownView, 'button:calendar:open', this.__onButtonCalendarOpen, this);
        this.listenTo(this.calendarDropdownView, 'panel:select', this.__onPanelSelect, this);

        this.popoutRegion.show(this.calendarDropdownView);
    },

    __onBeforeClose: function () {
        this.calendarDropdownView.button.endEditing();
        this.trigger('blur');
    },

    __onOpen: function () {
        this.calendarDropdownView.button.startEditing();
        this.trigger('focus');
    },

    __onPanelSelect: function () {
        this.calendarDropdownView.close();
    },

    __onButtonCalendarOpen: function () {
        this.calendarDropdownView.open();
    },

    __onButtonFocus: function () {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.calendarDropdownView.open();
        }
    },

    focus: function () {
        this.calendarDropdownView.button.focus();
    },

    blur: function () {
        this.calendarDropdownView.close();
    }
});
