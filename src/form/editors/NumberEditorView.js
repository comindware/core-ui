import template from './templates/numberEditor.hbs';
import BaseEditorView from './base/BaseEditorView';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapNumber from './iconsWraps/iconWrapNumber.html';
import { maskInput, createNumberMask } from 'lib'; //docs: https://github.com/text-mask/text-mask/tree/master/addons

const changeMode = {
    keydown: 'keydown',
    blur: 'blur'
};

const defaultAllowFroat = false;

const defaultOptions = {
    max: undefined,
    min: undefined,
    step: undefined,
    changeMode: changeMode.blur,
    format: undefined,
    showTitle: true,
    class: undefined,
    allowFloat: defaultAllowFroat,
    requireDecimal: false,
    allowNegative: true,
    allowLeadingZeroes: false,
    intlOptions: {
        style: 'decimal',
        useGrouping: true,
        /* The following properties fall into two groups: minimumIntegerDigits, minimumFractionDigits, and maximumFractionDigits in one group, 
        minimumSignificantDigits and maximumSignificantDigits in the other. If at least one property from the second group is defined, 
        then the first group is ignored. https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat */
        minimumFractionDigits: 0,
        maximumFractionDigits: defaultAllowFroat ? 3 : 0,
        maximumSignificantDigits: undefined, //default from Intl is 21
        minimumSignificantDigits: undefined //default from Intl is 1
    }
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
 * @param {Number} [options.min=null] Минимальное возможное значение. Если <code>null</code>, не ограничено.
 * 
 * !!!Deprecated @param {String} [options.format=null] A [NumeralJS](http://numeraljs.com/) format string (e.g. '$0,0.00' etc.).
 * @param {Object} [options.intlOptions=null] options for new Intl.NumberFormat([locales[, options]]) https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
 * 
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.Number = BaseEditorView.extend({
    template: Handlebars.compile(template),

    focusElement: '.js-input',

    className: 'editor editor_number',

    initialize(options) {
        this.__applyOptions(options, defaultOptions);

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
                suffix: '',
                includeThousandsSeparator: options.intlOptions.useGrouping,
                thousandsSeparatorSymbol: this.thousandsSeparator,
                allowDecimal: options.allowFloat,
                decimalSymbol: this.decimalSymbol,
                decimalLimit: options.intlOptions.maximumFractionDigits,
                integerLimit: options.intlOptions.maximumSignificantDigits || null,
                requireDecimal: options.requireDecimal,
                allowNegative: options.allowNegative,
                allowLeadingZeroes: options.allowLeadingZeroes
            });
        }
        this.isChangeModeKeydown = this.options.changeMode === changeMode.keydown;
    },

    ui: {
        input: '.js-input',
        clearButton: '.js-clear-button',
    },

    events() {
        const events = {
            'click @ui.clearButton': '__clear',
            'keyup @ui.input': '__keyup',
            'change @ui.input': '__onChange'
        };
        if (!this.options.hideClearButton) {
            events.mouseenter = '__onMouseenter';
        }
        return events;
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

    __keyup(event) {
        const value = event.target.value;
        if (this.__isTypeInFractionPart(value) && this.__isTypeInTheEnd(value) && value.slice(-1) === '0') {
            return;
        }

        const parsed = this.__parse(value);
        if (parsed === 0 && value[0] === '-') {
            return;
        }

        this.__value(value, true, this.isChangeModeKeydown, false);
    },

    __isTypeInFractionPart(value) {
        const posCaret = this.ui.input[0].selectionStart;
        const posDecimalSymbol = value.indexOf(this.decimalSymbol);
        return posDecimalSymbol !== -1 && posCaret > posDecimalSymbol;
    },

    __isTypeInTheEnd(value) {
        const posCaret = this.ui.input[0].selectionStart;
        return posCaret === value.length;
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
        BaseEditorView.prototype.__setEnabled.call(this, enabled);
        this.ui.input.prop('disabled', !enabled);
    },

    __setReadonly(readonly) {
        BaseEditorView.prototype.__setReadonly.call(this, readonly);
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
        if ((value === this.value && !force) || (typeof value === 'string' && [this.decimalSymbol, '_', '-'].includes(value.slice(-1)))) { // '_' - placeholder from mask
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
        this.__updateEmpty();

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
    },

    __onMouseenter() {
        this.$el.off('mouseenter');

        if (!this.options.hideClearButton) {
            this.renderIcons(iconWrapNumber, iconWrapRemove);
        }
    }
}));
