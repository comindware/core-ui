// @flow
import template from './templates/dateTimeEditor.hbs';
import DateTimeService from './services/DateTimeService';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapDate from './iconsWraps/iconWrapDate.html';
import DateInputView from './impl/dateTime/views/DateInputView';
import DatePanelView from './impl/dateTime/views/DatePanelView';
import dropdown from 'dropdown';
import TimeInputView from './impl/dateTime/views/TimeInputView';
import { dateHelpers, keyCode } from 'utils';
import GlobalEventService from '../../services/GlobalEventService';

const defaultOptions = {
    allowEmptyValue: true,
    dateDisplayFormat: undefined,
    timeDisplayFormat: undefined,
    showTitle: true
};

/**
 * @name DateTimeEditorView
 * @memberof module:core.form.editors
 * @class Combined date and time editor. Supported data type: <code>String</code> in ISO8601 format
 * (for example, '2015-07-20T10:46:37Z').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object.
 * All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowEmptyValue=true] - Whether to display a delete button that sets the value to <code>null</code>.
 * E.g. for UTC+3 enter <code>180</code>. Negative values allowed. Defaults to browser timezone offset.
 * @param {String} [options.dateDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'M/D/YYYY' etc.).
 * @param {String} [options.timeDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'LTS' etc.).
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.DateTime = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        this.value = this.__adjustValue(this.value);
        this.enabled = this.getEnabled();
        this.readonly = this.getReadonly();
    },

    ui: {
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__onClear',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave'
    },

    regions: {
        timeDropdownRegion: {
            el: '.js-time-dropdown-region',
            replaceElement: true
        },
        dateDropdownRegion: {
            el: '.js-date-dropdown-region',
            replaceElement: true
        }
    },

    className: 'editor editor_date-time',

    template: Handlebars.compile(template),

    templateContext() {
        return this.options;
    },

    setValue(value: String): void {
        this.__value(value, true, false);
    },

    getValue(): string {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    __keyAction(event) {
        const dropdownView = this.calendarDropdownView;
        if (dropdownView.isOpen && event.keyCode === keyCode.ENTER) {
            const newValue = dropdownView.button.ui.dateInput.val();
            const newDate = new Date(newValue);
            dropdownView.panelView.updatePickerDate(newDate);
            this.__onDateChange(newDate, false);
        }
    },

    onRender(): void {
        this.__updateClearButton();
        if (this.options.showTitle) {
            this.__updateTitle();
        }

        if (this.options.showTime !== false) {
            this.__createTimeDropdownView();
        }

        if (this.options.showDate !== false) {
            this.__createDateDropdownEditor();
        }
    },

    __updateClearButton(): void {
        if (!this.options.allowEmptyValue || !this.getValue()) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
    },

    __value(newValue, updateUi, triggerChange): void {
        const value = this.__adjustValue(newValue);
        if (this.value === value) {
            return;
        }
        this.value = value;
        if (this.options.showTitle) {
            this.__updateTitle();
        }

        if (updateUi) {
            this.calendarDropdownView && this.calendarDropdownView.button.setValue(value);
            this.timeDropdownView && this.timeDropdownView.button.setValue(value);
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __setEnabled(enabled: boolean): void {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.enabled = this.getEnabled();
    },

    __setReadonly(readonly: boolean): void {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.readonly = this.getReadonly();
    },

    __onClear(): boolean {
        this.__value(null, true, true);
        return false;
    },

    focusElement: null,

    focus(): void {
        if (this.enabled && !this.readonly) {
            this.calendarDropdownView.open();
            this.calendarDropdownView.panelView.updatePickerDate(this.__getDateByValue(this.value));
            this.calendarDropdownView.button.focus();
        }
    },

    blur(): void {
        this.__dateBlur();
        this.__timeBlur();
    },

    onFocus(): void {
        BaseLayoutEditorView.prototype.onFocus.call(this);
    },

    __adjustValue(value: string): string {
        return value === null ? value : moment(value).toISOString();
    },

    __updateTitle(): void {
        const dateDisplayValue = DateTimeService.getDateDisplayValue(this.getValue(), this.options.dateDisplayFormat);
        const timeDisplayValue = DateTimeService.getTimeDisplayValue(this.getValue(), this.options.timeDisplayFormat);
        const resultValue = `${dateDisplayValue} ${timeDisplayValue}`;
        this.$el.prop('title', resultValue);
    },

    __onMouseenter() {
        this.el.insertAdjacentHTML('beforeend', this.value ? iconWrapRemove : iconWrapDate);
    },

    __onMouseleave() {
        this.el.removeChild(this.el.lastElementChild);
    },

    __getDateByValue(value) {
        if (!value) {
            return new Date();
        }

        return new Date(value);
    },

    __createDateDropdownEditor() {
        this.calendarDropdownView = dropdown.factory.createDropdown({
            buttonView: DateInputView,
            buttonViewOptions: {
                value: this.value,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.options.allowEmptyValue,
                dateDisplayFormat: this.options.dateDisplayFormat,
                showTitle: this.options.showTitle
            },
            panelView: DatePanelView,
            panelViewOptions: {
                value: this.value,
                preserveTime: this.options.preserveTime,
                allowEmptyValue: this.options.allowEmptyValue
            },
            renderAfterClose: false,
            autoOpen: false,
            panelMinWidth: 'none'
        });

        this.listenTo(this.calendarDropdownView, 'button:focus', this.__onDateButtonFocus, this);
        this.listenTo(this.calendarDropdownView, 'button:calendar:open', this.__onDateButtonCalendarOpen, this);
        this.listenTo(this.calendarDropdownView, 'panel:select', this.__onDateChange, this);
        this.showChildView('dateDropdownRegion', this.calendarDropdownView);
    },

    __onDateChange(date, updateView = true) {
        const oldValue = new Date(this.value);
        let newVal = null;

        if (!isNaN(oldValue)) {
            newVal = moment(oldValue)
                .year(date.getFullYear())
                .month(date.getMonth())
                .date(date.getDate())
                .toISOString();
        } else {
            newVal = moment(date).toISOString();
        }

        this.__value(newVal, updateView, true);
        this.stopListening(GlobalEventService);
        this.calendarDropdownView.close();
    },

    __onDateButtonCalendarOpen() {
        if (this.enabled && !this.readonly) {
            this.calendarDropdownView.open();
            this.calendarDropdownView.panelView.updatePickerDate(this.__getDateByValue(this.value));
            this.listenTo(GlobalEventService, 'window:keydown:captured', (document, event) => this.__keyAction(event));
        }
    },

    __onDateButtonFocus() {
        if (this.enabled && !this.readonly) {
            this.calendarDropdownView.open();
            this.calendarDropdownView.panelView.updatePickerDate(this.__getDateByValue(this.value));
            this.listenTo(GlobalEventService, 'window:keydown:captured', (document, event) => this.__keyAction(event));
        }
    },

    __dateBlur() {
        this.calendarDropdownView.close();
    },

    hasFocus() {
        return this.el.contains(document.activeElement);
    },

    __timeBlur() {
        this.timeDropdownView.close();
    },

    timeHasFocus() {
        return this.el.contains(document.activeElement);
    },

    __createTimeDropdownView() {
        this.timeDropdownView = dropdown.factory.createDropdown({
            buttonView: TimeInputView,
            buttonViewOptions: {
                value: this.value,
                allowEmptyValue: this.options.allowEmptyValue,
                timeDisplayFormat: this.options.timeDisplayFormat,
                showTitle: this.options.showTitle
            },
            panelView: Marionette.CollectionView.extend({
                collection: new Backbone.Collection(),
                tagName: 'ul',
                className: 'dropdown__wrp dropdown__wrp_time',
                childViewEvents: {
                    select(time) {
                        this.trigger('select', time);
                    }
                },
                childView: Marionette.View.extend({
                    tagName: 'li',
                    className: 'time-dropdown__i',
                    events: {
                        click() {
                            this.trigger('select', this.model.get('time'));
                        }
                    },
                    template: Handlebars.compile('{{formattedTime}}')
                })
            }),
            renderAfterClose: false,
            autoOpen: false
        });

        this.listenTo(this.timeDropdownView, 'button:focus', this.__onTimeButtonFocus, this);
        this.listenTo(this.timeDropdownView, 'button:calendar:open', this.__onTimeButtonCalendarOpen, this);
        this.listenTo(this.timeDropdownView, 'panel:select', this.__onTimePanelSelect, this);
        this.showChildView('timeDropdownRegion', this.timeDropdownView);
    },

    __onTimePanelSelect(time) {
        const oldValue = this.__getDateByValue(this.value);
        let newVal = null;

        if (!isNaN(oldValue)) {
            newVal = moment(oldValue)
                .hour(time.hour())
                .minute(time.minute())
                .second(0)
                .millisecond(0)
                .toISOString();
        } else {
            newVal = time.toISOString();
        }

        this.__value(newVal, true, true);
        this.timeDropdownView.close();
    },

    __timeDropdownOpen() {
        this.timeDropdownView.open();
        const panelView = this.timeDropdownView.panelView;
        if (!panelView.collection.length) {
            panelView.collection.reset(this.__getTimeCollection());
        }
    },

    __getTimeCollection() {
        const timeArray = [];

        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const val = { hours: h, minutes: m };
                const time = moment(val);
                const formattedTime = dateHelpers.getDisplayTime(time);

                timeArray.push({
                    time,
                    formattedTime
                });
            }
        }

        return timeArray;
    },

    __onTimeButtonCalendarOpen() {
        if (this.enabled && !this.readonly) {
            this.__timeDropdownOpen();
        }
    },

    __onTimeButtonFocus() {
        if (this.enabled && !this.readonly) {
            this.__timeDropdownOpen();
        }
    }
}));
