import template from './templates/numberEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapNumber from './iconsWraps/iconWrapNumber.html';
import { maskInput, createNumberMask } from 'lib'; //docs: https://github.com/text-mask/text-mask/tree/master/addons

const changeMode = {
    keydown: 'keydown',
    blur: 'blur'
};

const defaultOptions = {
    max: undefined,
    min: undefined,
    step: undefined,
    allowFloat: false,
    changeMode: changeMode.blur,
    format: undefined,
    intlOptions: undefined,
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
 * 
 * !!!Deprecated @param {String} [options.format=null] A [NumeralJS](http://numeraljs.com/) format string (e.g. '$0,0.00' etc.).
 * @param {Object} [options.intlOptions=null] options for new Intl.NumberFormat([locales[, options]])
 * 
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
        this.format = options.format || options.intlOptions || options.allowFloat;
        this.decimalSymbol = Core.services.LocalizationService.decimalSymbol;
        if (this.format) {
            this.intl = new Intl.NumberFormat(Core.services.LocalizationService.langCode, options.intlOptions);
            this.thousandsSeparator = Core.services.LocalizationService.thousandsSeparatorSymbol;
            if (options.intlOptions && options.intlOptions.useGrouping === false) {
                this.thousandsSeparator = '';
            }
            this.numberMask = createNumberMask({
                prefix: '',
                thousandsSeparatorSymbol: this.thousandsSeparator,
                decimalSymbol: this.decimalSymbol,
                allowDecimal: options.allowFloat,
                allowNegative: true
            });
        }
        this.isChangeModeKeydown = this.options.changeMode === changeMode.keydown;
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
    },

    onAttach() {
        if (this.format) {
            this.maskedInputController = maskInput({
                inputElement: this.ui.input[0],
                mask: this.numberMask
            });
        }
        this.__value(this.value, false, false, true);
    },

    onDestroy() {
        this.maskedInputController && this.maskedInputController.destroy();
    },

    __keyup() {
        const value = this.ui.input.val();
        if (value === `-${this.decimalSymbol}`) {
            return;
        }
        this.__value(value, true, this.isChangeModeKeydown, false);
    },

    __onChange() {
        const input = this.ui.input;
        const max = input[0].getAttribute('max');
        const min = input[0].getAttribute('min');
        const value = this.__checkMaxMinValue(input.val(), max, min);
        this.__value(value, false, true, false);
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
        this.__value(null, false, this.isChangeModeKeydown, false);
        this.focus();
        return false;
    },

    __value(newValue, suppressRender, triggerChange, force) {
        let value = newValue;
        if ((value === this.value && !force) || value === '-' || (this.options.allowFloat && typeof value === 'string' && value.slice(-1) === this.decimalSymbol)) {
            return;
        }

        let parsed;
        if (value !== '' && value !== null) {
            parsed = this.__parse(value);
            if (parsed !== null) {
                if (!this.options.allowFloat) {
                    value = Math.floor(parsed);
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

        if (!this.format || this.value === null) {
            this.ui.input.val(value);
        } else {
            this.maskedInputController && this.maskedInputController.textMaskInputElement.update(this.intl.format(value));
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
        this.options.min !== undefined && this.ui.input[0].setAttribute('min', this.options.min);
        this.options.max !== undefined && this.ui.input[0].setAttribute('max', this.options.max);
        this.options.step !== undefined && this.ui.input[0].setAttribute('step', this.options.step);
    },

    __parseToNumber(string) {
        let newValue = string.replace(new RegExp(`\\${this.decimalSymbol}`, 'g'), '.');
        if (this.thousandsSeparator) {
            newValue = newValue.replace(new RegExp(`\\${this.thousandsSeparator}`, 'g'), '');
        }
        newValue = newValue.replace(/[^\d\.-]*/g, '');

        return parseFloat(newValue);
    },

    __parseToString(number) {
        return String(number).replace(new RegExp('\\.', 'g'), this.decimalSymbol);     
    }
}));
