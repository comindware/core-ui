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
import { dateHelpers } from 'utils';

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

        this.model
            ? this.model.set(
                  {
                      readonly: this.readonly,
                      enabled: this.enabled,
                      value: this.value
                  },
                  { silent: true }
              )
            : (this.model = new Backbone.Model({
                  readonly: this.readonly,
                  enabled: this.enabled,
                  value: this.value
              }));
    },

    ui: {
        clearButton: '.js-clear-button',
        timeInput: '.js-time-input',
        dateInput: '.js-date-input'
    },

    events: {
        'click @ui.clearButton': '__onClear',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave',
        'focus @ui.timeInput': '__showTimeEditor',
        'mousedown @ui.timeInput': '__showTimeEditor',
        'focus @ui.dateInput': '__showDateEditor',
        'mousedown @ui.dateInput': '__showDateEditor'
    },

    regions: {
        timeDropdownRegion: '.js-time-dropdown-region',
        dateDropdownRegion: '.js-date-dropdown-region'
    },

    className: 'editor editor_date-time',

    template: Handlebars.compile(template),

    templateHelpers() {
        return this.options;
    },

    __change(): void {
        this.__value(this.model.get('value'), true, true);
        if (!this.isDestroyed) {
            this.__updateClearButton();
        }
        this.__updateDisplayValue();
    },

    setValue(value: String): void {
        this.__value(value, true, false);
        this.value = value;
    },

    getValue(): string {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    modelEvents: {
        'change:value': '__change'
    },

    onRender(): void {
        this.__updateClearButton();
        if (this.options.showTitle) {
            this.__updateTitle();
        }
        if (this.options.showDate === false) {
            this.ui.dateInput.hide();
        }
        if (this.options.showTime === false) {
            this.ui.timeInput.hide();
        }
        this.__updateDisplayValue();
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
        this.value = null;
        this.focus();

        return false;
    },

    focusElement: null,

    focus(): void {
        this.__dateFocus();
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

    __showDateEditor() {
        if (this.isDateDropdownShown) {
            return;
        }

        this.ui.dateInput[0] && this.ui.dateInput[0].remove();

        this.calendarDropdownView = dropdown.factory.createDropdown({
            buttonView: DateInputView,
            buttonViewOptions: {
                model: this.model,
                preserveTime: this.preserveTime,
                allowEmptyValue: this.options.allowEmptyValue,
                dateDisplayFormat: this.options.dateDisplayFormat,
                showTitle: this.options.showTitle
            },
            panelView: DatePanelView,
            panelViewOptions: {
                model: this.model,
                preserveTime: this.options.preserveTime,
                allowEmptyValue: this.options.allowEmptyValue
            },
            renderAfterClose: false,
            autoOpen: false,
            panelMinWidth: 'none'
        });
        this.listenTo(this.calendarDropdownView, 'before:close', this.__onDateBeforeClose, this);
        this.listenTo(this.calendarDropdownView, 'open', this.__onDateOpen, this);

        this.listenTo(this.calendarDropdownView, 'button:focus', this.__onDateButtonFocus, this);
        this.listenTo(this.calendarDropdownView, 'button:calendar:open', this.__onDateButtonCalendarOpen, this);
        this.listenTo(this.calendarDropdownView, 'panel:select', this.__onDatePanelSelect, this);
        this.showChildView('dateDropdownRegion', this.calendarDropdownView);
        this.isDateDropdownShown = true;

        if (this.enabled && !this.readonly) {
            this.calendarDropdownView.open();
        }
    },

    __onDateBeforeClose() {
        if (this.calendarDropdownView.isDestroyed) {
            return;
        }
        this.calendarDropdownView.button.endEditing();
    },

    __onDateOpen() {
        this.calendarDropdownView.button.startEditing();
    },

    __onDatePanelSelect() {
        this.calendarDropdownView.close();
    },

    __onDateButtonCalendarOpen() {
        this.calendarDropdownView.open();
    },

    __onDateButtonFocus() {
        if (this.enabled && !this.readonly) {
            this.calendarDropdownView.open();
        }
    },

    __dateFocus() {
        this.__showDateEditor();
        this.calendarDropdownView.button.focus();
    },

    __dateBlur() {
        this.calendarDropdownView.close();
    },

    hasFocus() {
        return this.el.contains(document.activeElement);
    },

    __updateDisplayValue() {
        if (!this.isTimeDropdownShown) {
            this.ui.timeInput.val(DateTimeService.getTimeDisplayValue(this.value, this.dateDisplayFormat));
        }
        if (!this.isDateDropdownShown) {
            this.ui.dateInput.val(DateTimeService.getDateDisplayValue(this.value, this.dateDisplayFormat));
        }
    },

    __showTimeEditor() {
        if (this.isTimeDropdownShown) {
            return;
        }

        this.ui.timeInput[0] && this.ui.timeInput[0].remove();

        this.timeDropdownView = this.__getTimeDropdownView();

        this.listenTo(this.timeDropdownView, 'before:close', this.__onTimeBeforeClose, this);
        this.listenTo(this.timeDropdownView, 'open', this.__onTimeOpen, this);

        this.listenTo(this.timeDropdownView, 'button:focus', this.__onTimeButtonFocus, this);
        this.listenTo(this.timeDropdownView, 'button:calendar:open', this.__onTimeButtonCalendarOpen, this);
        this.listenTo(this.timeDropdownView, 'panel:select', this.__onTimePanelSelect, this);
        this.showChildView('timeDropdownRegion', this.timeDropdownView);

        this.isTimeDropdownShown = true;

        if (this.enabled && !this.readonly) {
            this.timeDropdownView.open();
        }
    },

    __timeFocus() {
        this.__showTimeEditor();
        this.timeDropdownView.button.focus();
    },

    __timeBlur() {
        if (this.isTimeDropdownShown) {
            this.timeDropdownView.close();
        }
    },

    timeHasFocus() {
        return this.el.contains(document.activeElement);
    },

    __getTimeDropdownView() {
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

        return dropdown.factory.createDropdown({
            buttonView: TimeInputView,
            buttonViewOptions: {
                model: this.model,
                allowEmptyValue: this.options.allowEmptyValue,
                timeDisplayFormat: this.options.timeDisplayFormat,
                showTitle: this.options.showTitle
            },
            panelView: Marionette.CollectionView.extend({
                collection: new Backbone.Collection(timeArray),
                tagName: 'ul',
                className: 'dropdown__wrp dropdown__wrp_time',
                childViewEvents: {
                    select(view, time) {
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
    },

    __onTimeBeforeClose() {
        if (this.timeDropdownView.isDestroyed) {
            return;
        }
        this.timeDropdownView.button.endEditing();
    },

    __onTimeOpen() {
        this.timeDropdownView.button.startEditing();
    },

    __onTimePanelSelect(time) {
        const oldVal = this.model.get('value');
        let newVal = null;

        if (time === null || time === '') {
            newVal = null;
        } else if (oldVal) {
            newVal = moment(oldVal)
                .hour(time.hour())
                .minute(time.minute())
                .second(0)
                .millisecond(0)
                .toISOString();
        } else {
            newVal = time
                .clone()
                .minute(time.clone().minute())
                .toISOString();
        }

        this.model.set('value', newVal);

        this.timeDropdownView.close();
    },

    __onTimeButtonCalendarOpen() {
        this.timeDropdownView.open();
    },

    __onTimeButtonFocus() {
        if (this.enabled && !this.readonly) {
            this.timeDropdownView.open();
        }
    }
}));
