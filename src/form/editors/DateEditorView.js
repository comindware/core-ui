// @flow
import template from './templates/dateEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DateView from './impl/dateTime/views/DateView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapDate from './iconsWraps/iconWrapDate.html';

const defaultOptions = {
    allowEmptyValue: true,
    dateDisplayFormat: undefined,
    showTitle: true
};

/**
 * @name DateEditorView
 * @memberof module:core.form.editors
 * @class Calendar editor. The calendar opens in dropdown panel. Supported data type: <code>String</code> in ISO8601 format
 * (for example, '2015-07-20T00:00:00Z').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object.
 * All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowEmptyValue=true] - Whether to display a delete button that sets the value to <code>null</code>.
 * @param {String} [options.dateDisplayFormat=null] - A [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string (e.g. 'M/D/YYYY' etc.).
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute
 * */
formRepository.editors.Date = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        this.value = this.__adjustValue(this.value);

        this.dateModel = new Backbone.Model({
            value: this.value,
            enabled: this.getEnabled(),
            readonly: this.getReadonly()
        });
        this.listenTo(this.dateModel, 'change:value', this.__change, this);

        this.dateView = new DateView({
            model: this.dateModel,
            allowEmptyValue: this.options.allowEmptyValue,
            dateDisplayFormat: this.options.dateDisplayFormat,
            showTitle: this.options.showTitle
        });
        this.listenTo(this.dateView, 'focus', this.onFocus);
        this.listenTo(this.dateView, 'blur', this.onBlur);
    },

    regions: {
        dateRegion: '.js-date-region'
    },

    className: 'editor editor_date',

    template: Handlebars.compile(template),

    ui: {
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__onClear',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave'
    },

    __change() {
        this.__value(this.dateModel.get('value'), true, true);
        this.__updateClearButton();
    },

    __onClear() {
        this.__value(null, true, true);
        this.dateModel.set('value', null);
        this.focus();
        return false;
    },

    __updateClearButton() {
        if (!this.options.allowEmptyValue || !this.getValue()) {
            this.ui.clearButton.hide();
        } else {
            this.ui.clearButton.show();
        }
    },

    setValue(value) {
        this.__value(value, true, false);
        this.dateModel.set('value', value);
    },

    onRender() {
        this.dateRegion.show(this.dateView);
        this.__updateClearButton();
    },

    getValue() {
        return this.value === null ? this.value : moment(this.value).toISOString();
    },

    __value(val, updateUi, triggerChange) {
        const value = this.__adjustValue(val);
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __setEnabled(enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.dateModel.set({ enabled: this.getEnabled() });
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.dateModel.set({ readonly: this.getReadonly() });
    },

    focusElement: null,

    /**
     * Sets the focus onto this editor.
     */
    focus() {
        if (this.hasFocus) {
            return;
        }
        this.dateView.focus();
    },

    /**
     * Clears the focus.
     */
    blur() {
        if (!this.hasFocus) {
            return;
        }
        this.dateView.blur();
    },

    __adjustValue(value) {
        return value === null ? value : moment(value).toISOString();
    },

    __onMouseenter() {
        this.el.insertAdjacentHTML('beforeend', this.value ? iconWrapRemove : iconWrapDate);
    },

    __onMouseleave() {
        this.el.removeChild(this.el.lastElementChild);
    }
});

export default formRepository.editors.Date;
