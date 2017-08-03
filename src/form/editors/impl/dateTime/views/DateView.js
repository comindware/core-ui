/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars, $ } from 'lib';
import template from '../templates/date.hbs';
import dropdown from 'dropdown';
import PanelView from './DatePanelView';
import InputView from './DateInputView';

export default Marionette.LayoutView.extend({
    initialize() {
        this.timezoneOffset = this.getOption('timezoneOffset') || 0;
        this.preserveTime = !!this.getOption('preserveTime'); // If false (default), drop time components on date change
        this.allowEmptyValue = this.getOption('allowEmptyValue');
        this.dateDisplayFormat = this.getOption('dateDisplayFormat');
    },

    template: Handlebars.compile(template),

    className: 'date-view',

    regions: {
        popoutRegion: '.js-popout-region'
    },

    onShow() {
        this.calendarDropdownView = dropdown.factory.createDropdown({
            buttonView: InputView,
            buttonViewOptions: {
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.allowEmptyValue,
                dateDisplayFormat: this.dateDisplayFormat
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.model,
                timezoneOffset: this.timezoneOffset,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.allowEmptyValue
            },
            renderAfterClose: false,
            autoOpen: false,
            panelMinWidth: 'none'
        });
        this.listenTo(this.calendarDropdownView, 'before:close', this.__onBeforeClose, this);
        this.listenTo(this.calendarDropdownView, 'open', this.__onOpen, this);

        this.listenTo(this.calendarDropdownView, 'button:focus', this.__onButtonFocus, this);
        this.listenTo(this.calendarDropdownView, 'button:calendar:open', this.__onButtonCalendarOpen, this);
        this.listenTo(this.calendarDropdownView, 'panel:select', this.__onPanelSelect, this);

        this.popoutRegion.show(this.calendarDropdownView);
    },

    __onBeforeClose() {
        this.calendarDropdownView.button.endEditing();
        this.trigger('blur');
    },

    __onOpen() {
        this.calendarDropdownView.button.startEditing();
        this.trigger('focus');
    },

    __onPanelSelect() {
        this.calendarDropdownView.close();
    },

    __onButtonCalendarOpen() {
        this.calendarDropdownView.open();
    },

    __onButtonFocus() {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.calendarDropdownView.open();
        }
    },

    focus() {
        this.calendarDropdownView.button.focus();
    },

    blur() {
        this.calendarDropdownView.close();
    },

    hasFocus() {
        return $.contains(this.el, document.activeElement);
    }
});
