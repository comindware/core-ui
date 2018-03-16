/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import template from '../templates/date.hbs';
import dropdown from 'dropdown';
import PanelView from './DatePanelView';
import InputView from './DateInputView';
import DateTimeService from '../../../services/DateTimeService';

export default Marionette.LayoutView.extend({
    initialize() {
        this.preserveTime = !!this.getOption('preserveTime'); // If false (default), drop time components on date change
        this.allowEmptyValue = this.getOption('allowEmptyValue');
        this.dateDisplayFormat = this.getOption('dateDisplayFormat');
        this.showTitle = this.getOption('showTitle');
    },

    template: Handlebars.compile(template),

    className: 'date-view',

    regions: {
        popoutRegion: '.js-popout-region'
    },

    ui: {
        initialValue: '.js-date-input'
    },

    events: {
        focus: '__showEditor',
        mousedown: '__showEditor'
    },

    modelEvents: {
        'change:value': '__updateDisplayValue',
    },

    onRender() {
        this.__updateDisplayValue();
    },

    __updateDisplayValue() {
        if (this.isDropdownShown) {
            return;
        }
        this.ui.initialValue.val(DateTimeService.getDateDisplayValue(this.model.get('value'), this.dateDisplayFormat));
    },

    __showEditor() {
        if (this.isDropdownShown) {
            return;
        }
        this.el.firstElementChild && this.el.firstElementChild.remove();
        this.calendarDropdownView = dropdown.factory.createDropdown({
            buttonView: InputView,
            buttonViewOptions: {
                model: this.model,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.allowEmptyValue,
                dateDisplayFormat: this.dateDisplayFormat,
                showTitle: this.showTitle
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.model,
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
        this.isDropdownShown = true;
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.calendarDropdownView.open();
        }
    },

    __onBeforeClose() {
        if (this.calendarDropdownView.isDestroyed) {
            return;
        }
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
        this.__showEditor();
        this.calendarDropdownView.button.focus();
    },

    blur() {
        this.calendarDropdownView.close();
    },

    hasFocus() {
        return $.contains(this.el, document.activeElement);
    }
});
