import template from './templates/numberEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapNumber from './iconsWraps/iconWrapNumber.html';

const changeMode = {
    keydown: 'keydown',
    blur: 'blur'
};

const defaultOptions = {
    max: undefined,
    min: 0,
    allowFloat: false,
    changeMode: changeMode.blur,
    format: undefined,
    showTitle: true,
    class: undefined
};

/**
 * @name NumberEditorView
 * @memberof module:core.form.editors
 * @class Редактор числовых значений. Поддерживаемый тип данных: <code>Number</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowFloat=false] Если <code>true</code>, ко вводу допускаются значения с плавающей точкой.
 * @param {String} [options.changeMode='blur'] Определяет момент обновления значения редактора:<ul>
 *     <li><code>'keydown'</code> - при нажатии клавиши.</li>
 *     <li><code>'blur'</code> - при потери фокуса.</li></ul>
 * @param {Number} [options.max=null] Максимальное возможное значение. Если <code>null</code>, не ограничено.
 * @param {Number} [options.min=0] Минимальное возможное значение. Если <code>null</code>, не ограничено.
 * @param {String} [options.format=null] A [NumeralJS](http://numeraljs.com/) format string (e.g. '$0,0.00' etc.).
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.Number = BaseItemEditorView.extend({
    template: Handlebars.compile(template),

    focusElement: '.js-input',

    className() {
        _.defaults(this.options, _.pick(this.options.schema ? this.options.schema : this.options, Object.keys(defaultOptions)), defaultOptions);

        return `${this.options.class || ''} editor editor_number`;
    },

    ui: {
        input: '.js-input'
    },

    events: {
        'click .js-clear-button': '__clear',
        'keydown @ui.input': '__keydown',
        'keypress @ui.input': '__keypress',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave',
        'keyup @ui.input'() {
            if (this.options.changeMode === changeMode.keydown) {
                this.__value(this.ui.input.val(), true, true, false);
            } else {
                this.__value(this.ui.input.val(), true, false, false);
            }
        },
        'change @ui.input'() {
            this.__value(this.ui.input.val(), false, true, false);
        }
    },

    onRender() {
        this.__setInputOptions();
        this.__value(this.value, false, false, true);
    },

    setValue(value) {
        this.__value(value, false, false, false);
    },

    isEmptyValue() {
        return !_.isNumber(this.getValue());
    },

    __setActive(el, isActive) {
        el.classList.toggle('ui-state-active', isActive);
    },

    __setEnabled(enabled) {
        BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
        this.ui.input.prop('disabled', !enabled);
    },

    __setReadonly(readonly) {
        BaseItemEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled()) {
            this.ui.input.prop('readonly', readonly);
            this.ui.input.prop('tabindex', readonly ? -1 : 0);
        }
    },

    __clear() {
        this.__value(null, false, true, false);
        this.focus();
        return false;
    },

    __value(newValue, suppressRender, triggerChange, force) {
        let value = newValue;
        if (value === this.value && !force) {
            return;
        }
        let parsed;
        let formattedValue = null;
        if (value !== '' && value !== null) {
            parsed = this.__parse(value);
            if (parsed !== null) {
                if (!this.options.allowFloat) {
                    value = Math.floor(parsed);
                } else {
                    value = parsed;
                }
                if (this.options.format) {
                    formattedValue = new Intl.NumberFormat(Core.services.LocalizationService.langCode, {
                        minimumIntegerDigits: 1,
                        minimumFractionDigits: 2
                    }).format(parsed);
                }
            } else {
                value = null;
            }
        } else if (value === '') {
            value = null;
        }

        this.value = value;
        if (this.options.showTitle) {
            if (formattedValue) {
                this.$el.prop('title', formattedValue);
            } else {
                this.$el.prop('title', value);
            }
        }

        if (formattedValue) {
            this.ui.input.val(formattedValue);
        } else {
            this.ui.input.val(value);
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __parse(value) {
        let val = value;

        if (typeof val === 'string' && val !== '') {
            val = this.__parseNumber(val);
            if (val === Number.POSITIVE_INFINITY) {
                val = Number.MAX_VALUE;
            } else if (val === Number.NEGATIVE_INFINITY) {
                val = Number.MIN_VALUE;
            }
        }

        return val === '' || isNaN(val) ? null : val;
    },

    __onMouseenter() {
        this.el.insertAdjacentHTML('beforeend', this.value ? iconWrapRemove : iconWrapNumber);
    },

    __onMouseleave() {
        this.el.removeChild(this.el.lastElementChild);
    },

    __setInputOptions() {
        this.ui.input[0].setAttribute('min', this.options.min);
        this.ui.input[0].setAttribute('max', this.options.max);
        this.ui.input[0].setAttribute('step', this.options.step);
    },

    __getNumberSeparator() {
        return new Intl.NumberFormat(Core.services.LocalizationService.langCode).format(1111).substring(1, 2);
    },

    __parseNumber(value) {
        const hundredsSeparator = this.__getNumberSeparator();

        const newValue = value.replace(new RegExp(`${hundredsSeparator}*`, 'g'), '');

        return parseFloat(newValue.replace(/[^\d\.\,]*/g, ''));
    }
}));
