// @flow
import template from './templates/dateTimeEditor.hbs';
import DateTimeService from './services/DateTimeService';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DateView from './impl/dateTime/views/DateView';
import TimeView from './impl/dateTime/views/TimeView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapDate from './iconsWraps/iconWrapDate.html';

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
formRepository.editors.DateTime = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        const readonly = this.getReadonly();
        const enabled = this.getEnabled();

        this.value = this.__adjustValue(this.value);

        this.dateTimeModel = new Backbone.Model({
            value: this.value,
            readonly,
            enabled
        });

        this.listenTo(this.dateTimeModel, 'change:value', this.__change, this);
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
        dateRegion: '.js-date-region',
        timeRegion: '.js-time-region'
    },

    className: 'editor editor_date-time',

    template: Handlebars.compile(template),

    templateHelpers() {
        return this.options;
    },

    __change(): void {
        this.__value(this.dateTimeModel.get('value'), true, true);
        if (!this.isDestroyed) {
            this.__updateClearButton();
        }
    },

    setValue(value: String): void {
        this.__value(value, true, false);
        this.dateTimeModel.set('value', value);
    },

    getValue(): string {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    onRender(): void {
        this.dateView = new DateView({
            model: this.dateTimeModel,
            preserveTime: true,
            allowEmptyValue: this.options.allowEmptyValue,
            dateDisplayFormat: this.options.dateDisplayFormat,
            showTitle: false
        });
        this.listenTo(this.dateView, 'focus', this.onFocus);
        this.listenTo(this.dateView, 'blur', this.onDateBlur);

        this.timeView = new TimeView({
            model: this.dateTimeModel,
            allowEmptyValue: this.options.allowEmptyValue,
            timeDisplayFormat: this.options.timeDisplayFormat,
            showTitle: false
        });
        this.listenTo(this.timeView, 'focus', this.onFocus);
        this.listenTo(this.timeView, 'blur', this.onTimeBlur);

        this.dateRegion.show(this.dateView);
        this.timeRegion.show(this.timeView);
        this.__updateClearButton();
        if (this.options.showTitle) {
            this.__updateTitle();
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
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __setEnabled(enabled: boolean): void {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.dateTimeModel.set({ enabled: this.getEnabled() });
    },

    __setReadonly(readonly: boolean): void {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.dateTimeModel.set({ readonly: this.getReadonly() });
    },

    __onClear(): boolean {
        this.__value(null, true, true);
        this.dateTimeModel.set('value', null);
        this.focus();

        return false;
    },

    focusElement: null,

    /**
     * Sets the focus onto this editor.
     */
    focus(): void {
        if (this.hasFocus) {
            return;
        }
        this.dateView.focus();
    },

    /**
     * Clears the focus.
     */
    blur(): void {
        if (!this.hasFocus) {
            return;
        }
        this.dateView.blur();
        this.timeView.blur();
    },

    onFocus(): void {
        BaseLayoutEditorView.prototype.onFocus.call(this);
    },

    onDateBlur(): void {
        if (this.timeView.hasFocus()) {
            return;
        }
        this.onBlur();
    },

    onTimeBlur(): void {
        if (this.dateView.hasFocus()) {
            return;
        }
        this.onBlur();
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
    }
});

export default formRepository.editors.DateTime;
