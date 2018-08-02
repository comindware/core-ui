import template from './templates/numberEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapNumber from './iconsWraps/iconWrapNumber.html';
import { maskInput, createNumberMask } from 'lib';

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

    initialize(options) {
        if (options.format) {
            this.thousandsSeparator = Core.services.LocalizationService.thousandsSeparatorSymbol;
            this.decimalSymbol = Core.services.LocalizationService.decimalSymbol;
            this.numberMask = createNumberMask({
                prefix: '',
                thousandsSeparatorSymbol: this.thousandsSeparator,
                decimalSymbol: this.decimalSymbol,
                allowDecimal: options.allowFloat,
                requireDecimal: options.allowFloat,
                allowNegative: true
            });
        }
    },
    ui: {
        input: '.js-input'
    },

    events: {
        'click .js-clear-button': '__clear',
        'keyup @ui.input': '__keyup',
        'change @ui.input': '__onChange',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave'
    },

    onRender() {
        this.__setInputOptions();
        this.__value(this.value, false, false, true);
    },

    onAttach() {
        if (this.options.format) {
            this.maskedInputController = maskInput({
                inputElement: this.ui.input[0],
                mask: this.numberMask
            });
        }
    },

    onDestroy() {
        this.maskedInputController && this.maskedInputController.destroy();
    },

    __keyup() {
        const value = this.ui.input.val();
        if (value === `-${this.decimalSymbol}`) {
            return;
        }
        if (this.options.changeMode === changeMode.keydown) {
            this.__value(value, true, true, false);
        } else {
            this.__value(value, true, false, false);
        }
    },

    __onChange() {
        const input = this.ui.input;
        const max = input[0].getAttribute('max');
        const min = input[0].getAttribute('min');
        const value = this.__checkMaxMinValue(input.val(), max, min);
        this.__value(value, false, true, false);
        if (this.options.format) {
            this.maskedInputController && this.maskedInputController.textMaskInputElement.update(value);
        } else {
            this.ui.input.val(value);
        }
    },

    __checkMaxMinValue(value, max, min) {
        let val = this.__parseToNumber(value);
        if (max) {
            val = val > Number(max) ? max : val;
        }
        if (min) {
            val = val < Number(min) ? min : val;
        }
        return this.__parseToString(val);
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
        if ((value === this.value && !force) || value === '-') {
            return;
        }

        let parsed;
        if (value !== '' && value !== null) {
            parsed = this.__parse(value);
            if (parsed !== null) {
                if (!this.options.allowFloat) {
                    value = Math.round(parsed);
                } else {
                    value = parsed;
                }
            } else {
                value = null;
            }
        } else if (value === '') {
            value = null;
        }

        this.value = value;
        if (this.options.showTitle) {
            this.$el.prop('title', value);
        }

        if (!this.options.format || this.ui.input.val() === '' || value === null) {
            this.ui.input.val(value);
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __parse(value) {
        let val = value;

        if (typeof val === 'string' && val !== '') {
            val = this.__parseToNumber(val);
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

    __parseToNumber(string) {
        let newValue = string.replace(new RegExp(`\\${this.thousandsSeparator}`, 'g'), '');
        newValue = newValue.replace(new RegExp(`\\${this.decimalSymbol}`, 'g'), '.');
        newValue = newValue.replace(/[^\d\.-]*/g, '');

        return parseFloat(newValue);
    },

    __parseToString(number) {
        return String(number).replace(new RegExp('\\.', 'g'), this.decimalSymbol);     
    }
}));
