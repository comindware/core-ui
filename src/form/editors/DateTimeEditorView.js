// @flow
import template from './templates/dateTimeEditor.hbs';
import DateTimeService from './services/DateTimeService';
import BaseEditorView from './base/BaseEditorView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapDate from './iconsWraps/iconWrapDate.html';
import iconWrapTime from './iconsWraps/iconWrapTime.html';
import DatePanelView from './impl/dateTime/views/DatePanelView';
import DateInputView from './impl/dateTime/views/DateInputView';
import dropdown from 'dropdown';
import { dateHelpers, keyCode } from 'utils';
import GlobalEventService from '../../services/GlobalEventService';
import DurationEditorView from './DurationEditorView';
import { getClasses } from './impl/dateTime/meta';

const defaultOptions = () => ({
    allowEmptyValue: true,
    dateDisplayFormat: dateHelpers.getFormat('dateISO'),
    timeDisplayFormat: undefined,
    showTitle: true,
    showDate: true,
    showTime: true,
    allFocusableParts: {
        maxLength: 2,
        text: ':'
    },
    seconds: {
        text: ''
    }
});

const millisecondsPerDay = 86400000; // 24 * 60 * 60 * 1000

const defaultClasses = 'editor editor_date-time dropdown_root';

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
 * @param {Object} [allFocusableParts] Params for time editor's part. Like Duration Editor Options.
 * @param {Object} [days, minutes, hours, seconds] Params for time editor's part. Like Duration Editor Options.
 * */

export default (formRepository.editors.DateTime = BaseEditorView.extend({
    initialize() {
        this.value = this.__adjustValue(this.value);
        this.enabled = this.getEnabled();
        this.readonly = this.getReadonly();
    },

    ui: {
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__onClear',
        mouseenter: '__onMouseenter'
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

    className() {
        _.defaults(this.options, _.pick(this.options?.schema ? this.options?.schema : this.options, Object.keys(defaultOptions())), defaultOptions());

        this.displayClasses = getClasses();

        return this.__getClassName();
    },

    template: Handlebars.compile(template),

    templateContext() {
        return this.options;
    },

    setValue(value: String): void {
        this.__value(value, true, false);
    },

    getValue(): string {
        return this.__adjustValue(this.value);
    },

    onRender(): void {
        this.__presentView();
    },

    focusElement: '.editor_date-time_date input',

    focus(): void {
        if (this.options.showDate) {
            this.__openCalendarPicker();
            this.calendarDropdownView?.button?.focus();
        } else if (this.options.showTime) {
            this.timeDropdownView?.open();
            this.timeDropdownView?.button?.focus();
        }
    },

    blur(): void {
        this.options.showDate && this.__dateBlur();
        this.options.showTime && this.__timeBlur();
    },

    setFormat(newFormat) {
        if (typeof newFormat !== 'object') {
            return;
        }
        this.options.dateDisplayFormat = newFormat.dateDisplayFormat;
        this.options.timeDisplayFormat = newFormat.timeDisplayFormat;

        this.options.showDate = !!this.options.dateDisplayFormat;
        this.options.showTime = !!this.options.timeDisplayFormat;

        this.__presentView();

        this.$el.attr('class', this.__getClassName());
    },

    __dateButtonInputKeydown(buttonView, event) {
        switch (event.keyCode) {
            case keyCode.DELETE:
            case keyCode.BACKSPACE:
                this.calendarDropdownView.close();
                return;
            case keyCode.F2:
                this.__toggleCalendarPicker();
                return;
            case keyCode.ENTER:
                this.__triggerChange();
                this.__toggleCalendarPicker();
                return;
            default:
                break;
        }

        if (!this.calendarDropdownView.isOpen) {
            return;
        }

        let newValue;
        const oldValue = this.value === null ? undefined : this.value;
        switch (event.keyCode) {
            case keyCode.UP:
                newValue = event.shiftKey ?
                    moment(oldValue).add(1, 'years') :
                    moment(oldValue).subtract(1, 'weeks');
                break;
            case keyCode.DOWN:
                newValue = event.shiftKey ?
                    moment(oldValue).subtract(1, 'years') :
                    moment(oldValue).add(1, 'weeks');
                break;
            case keyCode.LEFT:
                newValue = event.shiftKey ?
                    moment(oldValue).subtract(1, 'months') :
                    moment(oldValue).subtract(1, 'days');
                break;
            case keyCode.RIGHT:
                newValue = event.shiftKey ?
                    moment(oldValue).add(1, 'months') :
                    moment(oldValue).add(1, 'days');
                break;
            default:
                return;
        }

        const amountMilliseconds = newValue.valueOf();

        this.__value(
            amountMilliseconds,
            true,
            false
        );

        this.__updatePickerDate(amountMilliseconds);
    },

    __updatePickerDate(date) {
        if (this.calendarDropdownView.isOpen) {
            this.calendarDropdownView.panelView?.updatePickerDate(date);
        }
    },

    __toggleCalendarPicker() {
        if (this.calendarDropdownView.isOpen) {
            this.calendarDropdownView.close();
        } else {
            this.__openCalendarPicker();
        }
    },

    __updateClearButton(): void {
        if (!this.options.allowEmptyValue || !this.getValue()) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
    },

    __value(newValue, updateButtons, triggerChange): void {
        const value = this.__adjustValue(newValue);
        if (this.value === value) {
            return;
        }
        this.value = value;
        if (this.options.showTitle) {
            this.__updateTitle();
        }

        if (updateButtons) {
            this.options.showDate && this.__setValueToDate(value);
            this.options.showTime && this.__setValueToTimeButton(value);
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __setEnabled(enabled: boolean): void {
        BaseEditorView.prototype.__setEnabled.call(this, enabled);
        this.enabled = this.getEnabled();
        //__setEnabled() from descendants
        this.calendarDropdownView?.button?.setEnabled(enabled);
        this.timeDropdownView?.button?.setEnabled(enabled);
    },

    __setReadonly(readonly: boolean): void {
        BaseEditorView.prototype.__setReadonly.call(this, readonly);
        this.readonly = this.getReadonly();
        //__setReadonly() from descendants
        this.calendarDropdownView?.button?.setReadonly(readonly);
        this.timeDropdownView?.button?.setReadonly(readonly);
    },

    __onClear(): boolean {
        this.__value(null, true, false);
        this.focus();
        return false;
    },

    __adjustValue(value: string): string {
        return value == null ? null : moment(value).toISOString();
    },

    __updateTitle(): void {
        const dateDisplayValue = DateTimeService.getDateDisplayValue(this.getValue(), this.options.dateDisplayFormat);
        const timeDisplayValue = DateTimeService.getTimeDisplayValue(this.getValue(), this.options.timeDisplayFormat);
        const resultValue = `${dateDisplayValue} ${timeDisplayValue}`;
        this.$el.prop('title', resultValue);
    },

    __createDateDropdownEditor() {
        this.dateButtonModel = new Backbone.Model({
            [this.key]: this.value == null ? '' : moment(this.value).format(this.options.dateDisplayFormat)
        });
        this.listenTo(this.dateButtonModel, `change:${this.key}`, this.__onDateModelChange);

        this.calendarDropdownView = dropdown.factory.createDropdown({
            buttonView: DateInputView,
            buttonViewOptions: {
                model: this.dateButtonModel,
                key: this.key,
                autocommit: true,
                readonly: this.options.readonly,
                allowEmptyValue: this.options.allowEmptyValue,
                dateDisplayFormat: this.options.dateDisplayFormat,
                emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER'),
                changeMode: 'blur',
                showTitle: false,
                hideClearButton: true
            },
            panelView: DatePanelView,
            panelViewOptions: {
                value: this.value,
                allowEmptyValue: this.options.allowEmptyValue
            },
            renderAfterClose: false,
            autoOpen: false,
            panelMinWidth: 'none',
            class: 'editor_date-time_date'
        });

        this.listenTo(this.calendarDropdownView, 'button:focus', this.__onDateButtonFocus, this);
        this.listenTo(this.calendarDropdownView, 'panel:select', this.__onPanelDateChange, this);
        this.showChildView('dateDropdownRegion', this.calendarDropdownView);
        this.listenTo(this.calendarDropdownView.buttonView, 'keydown', this.__dateButtonInputKeydown);
    },

    __updateDateAndValidateToButton(recipientISO, fromFormatted, { includeTime = false }) {
        const recipientMoment = moment(recipientISO || {});
        const fromMoment = DateTimeService.tryGetValidMoment(fromFormatted, this.options.dateDisplayFormat);
        if (fromMoment) {
            recipientMoment.date(fromMoment.date());
            recipientMoment.month(fromMoment.month());
            recipientMoment.year(fromMoment.year());
            if (includeTime) {
                recipientMoment.seconds(fromMoment.seconds());
                recipientMoment.minutes(fromMoment.minutes());
                recipientMoment.hours(fromMoment.hours());
            }
            this.dateButtonModel.set(this.key, recipientMoment.format(this.options.dateDisplayFormat));
        } else {
            this.dateButtonModel.set(this.key, Localizer.get('CORE.FORM.EDITORS.DATE.INVALIDDATE'));
        }
        return recipientMoment.toISOString();
    },

    __onDateModelChange(model, formattedDate, options) {
        if (options.inner) {
            return;
        }
        this.__value(
            this.__updateDateAndValidateToButton(this.value, formattedDate, { includeTime: false }),
            false,
            true
        );
    },

    __setValueToDate(value) {
        this.dateButtonModel.set(
            this.key,
            value == null ? value : moment(value).format(this.options.dateDisplayFormat),
            {
                inner: true
            }
        );
    },

    __onPanelDateChange(jsDate) {
        this.__value(
            this.__updateDateAndValidateToButton(this.value, jsDate, { includeTime: false }),
            true,
            true
        );
        this.stopListening(GlobalEventService);
        this.calendarDropdownView?.close();
    },

    __onDateButtonFocus() {
        this.__openCalendarPicker();
        this.onFocus();
    },

    __openCalendarPicker() {
        if (this.enabled && !this.readonly) {
            this.calendarDropdownView?.open();
            this.__updatePickerDate(this.value);
            this.calendarDropdownView?.adjustPosition();
        }
    },

    __dateBlur() {
        this.calendarDropdownView?.close();
        this.calendarDropdownView?.button?.blur();
        this.onBlur();
    },

    __timeBlur() {
        this.timeDropdownView?.close();
        this.timeDropdownView?.button?.blur();
        this.onBlur();
    },

    __createTimeDropdownView() {
        const model = new Backbone.Model({
            [this.key]: this.value == null ? '' : dateHelpers.dateISOToDuration(this.value, { days: false }).toISOString()
        });
        this.listenTo(model, 'change', this.__onTimeModelChange);

        const isFormatHasSeconds = dateHelpers.isFormatHasSeconds(this.options.timeDisplayFormat);

        this.timeDropdownView = dropdown.factory.createDropdown({
            buttonView: DurationEditorView,
            buttonViewOptions: _.defaultsPure(
                {
                    allowDays: false,
                    allowHours: true,
                    allowMinutes: true,
                    allowSeconds: isFormatHasSeconds,
                    minutes: {
                        text: this.options.minutes ? this.options.minutes.text : isFormatHasSeconds ? ':' : ''
                    },
                    showEmptyParts: true,
                    hideClearButton: true,
                    fillZero: true,
                    normalTime: true,
                    showTitle: false,
                    emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.DATE.TIMEEMPTYPLACEHOLDER'),
                    model
                },
                this.options
            ),
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
            autoOpen: false,
            class: 'editor_date-time_time'
        });

        this.listenTo(this.timeDropdownView, 'button:focus', this.__onTimeButtonFocus, this);
        this.listenTo(this.timeDropdownView, 'container:click', this.__onTimeButtonFocus, this);
        this.listenTo(this.timeDropdownView, 'panel:select', this.__onTimePanelSelect, this);
        this.showChildView('timeDropdownRegion', this.timeDropdownView);
    },

    __updateTime(ISOstr) {
        //replace time of ISO string to time from timebutton
        const valTimeModel = this.timeDropdownView && this.timeDropdownView.button.model.get(this.key);
        if (!valTimeModel) {
            return;
        }
        const dateMoment = moment(ISOstr || {}).clone();
        const timeDuration = moment.duration(valTimeModel).clone();
        dateMoment.hours(timeDuration.hours());
        dateMoment.minutes(timeDuration.minutes());
        dateMoment.seconds(timeDuration.seconds());
        return dateMoment.toISOString();
    },

    __onTimeModelChange(model) {
        if (model.get(this.key) === null) {
            return;
        }
        this.__value(this.__updateTime(this.value), false, true);
    },

    __setValueToTimeButton(dateISOstring) {
        const newDuration = dateISOstring && dateHelpers.dateISOToDuration(dateISOstring, { days: false }).toISOString();
        this.timeDropdownView && this.timeDropdownView.button.setValue(newDuration, true);
    },

    __onTimePanelSelect(time) {
        this.__setValueToTimeButton(time);
        this.timeDropdownView.close();
    },

    __timeDropdownOpen() {
        if (this.enabled && !this.readonly) {
            this.timeDropdownView.open();
            const panelView = this.timeDropdownView.panelView;
            if (!panelView.collection.length) {
                panelView.collection.reset(this.__getTimeCollection());
            }
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

    __onTimeButtonFocus() {
        this.__timeDropdownOpen();
        this.onFocus();
    },

    __onMouseenter() {
        this.$el.off('mouseenter');

        if (!this.options.hideClearButton) {
            this.renderIcons(this.options.showDate !== false ? iconWrapDate : iconWrapTime, iconWrapRemove);
        }
    },

    __presentView() {
        this.__updateClearButton();
        if (this.options.showTitle) {
            this.__updateTitle();
        }

        if (this.options.showTime !== false) {
            this.__createTimeDropdownView();
        } else {
            this.getRegion('timeDropdownRegion').reset();
        }

        if (this.options.showDate !== false) {
            this.__createDateDropdownEditor();
        } else {
            this.getRegion('dateDropdownRegion').reset();
        }
    },

    __getClassName() {
        return `${defaultClasses} ${this.displayClasses.dateMapClasses[this.options.dateDisplayFormat] || ''} ${this.displayClasses.timeMapClasses[
            this.options.timeDisplayFormat
        ] || ''}`;
    }
}));
