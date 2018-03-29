/**
 * Developer: Stepan Burguchev
 * Date: 10/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import template from './templates/numberEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';
import { numeral, Handlebars } from 'lib';
import { keyCode } from 'utils';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapNumber from './iconsWraps/iconWrapNumber.html';

const changeMode = {
    keydown: 'keydown',
    blur: 'blur'
};

const constants = {
    STEP: 1,
    PAGE: 10,
    INCREMENTAL: true
};

const defaultOptions = {
    max: undefined,
    min: 0,
    allowFloat: false,
    changeMode: changeMode.blur,
    format: undefined,
    showTitle: true
};

const allowedKeys = [
    keyCode.DELETE,
    keyCode.BACKSPACE,
    keyCode.TAB,
    keyCode.ESCAPE,
    keyCode.ENTER,
    keyCode.NUMPAD_ENTER,
    keyCode.NUMPAD_DECIMAL,
    keyCode.PERIOD,
    keyCode.COMMA,
    keyCode.HOME,
    keyCode.END,
    keyCode.RIGHT,
    keyCode.LEFT,
    keyCode.UP,
    keyCode.DOWN,
    keyCode.E,
    keyCode.ADD,
    keyCode.SUBTRACT,
    keyCode.NUMPAD_ADD,
    keyCode.NUMPAD_SUBTRACT,
    keyCode.SLASH
];

const ALLOWED_CHARS = '0123456789+-.,Ee';

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
formRepository.editors.Number = BaseItemEditorView.extend(/** @lends module:core.form.editors.NumberEditorView.prototype */{
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        _.bindAll(this, '__stop');
    },

    template: Handlebars.compile(template),

    focusElement: '.js-input',

    className: 'editor editor_number',

    ui: {
        input: '.js-input',
        spinnerUp: '.js-spinner-up',
        spinnerDown: '.js-spinner-down',
        spinnerButtons: '.js-spinner-button'
    },

    events: {
        'click .js-clear-button': '__clear',
        'keydown @ui.input': '__keydown',
        'keypress @ui.input': '__keypress',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave',
        'keyup @ui.input'(event) {
            if ([keyCode.UP, keyCode.DOWN, keyCode.PAGE_UP, keyCode.PAGE_DOWN].indexOf(event.keyCode) !== -1) {
                this.__stop();
            }
            if (this.options.changeMode === changeMode.keydown) {
                this.__value(this.ui.input.val(), true, true, false);
            } else {
                this.__value(this.ui.input.val(), true, false, false);
            }
        },
        'change @ui.input'() {
            this.__value(this.ui.input.val(), false, true, false);
        },
        'wheel @ui.input'(event) {
            if (!this.getEnabled() || this.getReadonly() || !this.hasFocus) {
                return;
            }

            this.__start();
            this.__spin((Math.sign(event.originalEvent.deltaY) > 0 ? 1 : -1) * constants.STEP);
            clearTimeout(this.mousewheelTimer);
            //noinspection JSCheckFunctionSignatures
            this.mousewheelTimer = setTimeout(this.__stop, 100);
            return false;
        },
        'mousedown @ui.spinnerUp'(event) {
            event.preventDefault();
            this.focus();
            this.__setActive(this.ui.spinnerDown, true);
            this.__start();
            this.__repeat(null, 1);
        },
        'mousedown @ui.spinnerDown'(event) {
            event.preventDefault();
            this.focus();
            this.__setActive(this.ui.spinnerUp, true);
            this.__start();
            this.__repeat(null, -1);
        },
        'mouseup @ui.spinnerButtons': '__stop',
        'mouseleave @ui.spinnerButtons': '__stop'
    },

    onRender() {
        this.__value(this.value, false, false, true);
    },

    __setActive(el, isActive) {
        if (isActive) {
            $(el).addClass('ui-state-active');
        } else {
            $(el).removeClass('ui-state-active');
        }
    },

    setPermissions(enabled, readonly) {
        BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
        if (enabled && !readonly) {
            this.ui.spinnerUp.show();
            this.ui.spinnerDown.show();
        } else {
            this.ui.spinnerUp.hide();
            this.ui.spinnerDown.hide();
        }
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

    __repeat(i = 500, steps) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (!this.isDestroyed) {
                this.__repeat(40, steps);
            }
        }, i);

        this.__spin(steps * constants.STEP);
    },

    __keydown(event) {
        this.__start();

        switch (event.keyCode) {
            case keyCode.UP:
                this.__repeat(null, 1, event);
                return false;
            case keyCode.DOWN:
                this.__repeat(null, -1, event);
                return false;
            case keyCode.PAGE_UP:
                this.__repeat(null, constants.PAGE, event);
                return false;
            case keyCode.PAGE_DOWN:
                this.__repeat(null, -constants.PAGE, event);
                return false;
            default:
                break;
        }

        if (event.ctrlKey === true || allowedKeys.indexOf(event.keyCode) !== -1) {
            return true;
        }
    },
    
    __keypress(event) {
        const code = event.which == null /* check for IE */ ? event.keyCode : event.charCode;
        return ALLOWED_CHARS.indexOf(String.fromCharCode(code)) !== -1;
    },

    __start() {
        if (!this.counter) {
            this.counter = 1;
        }
        this.spinning = true;
    },

    __spin(step) {
        let value = this.getValue() || 0;

        if (!this.counter) {
            this.counter = 1;
        }

        value = this.__adjustValue(value + step * this.__increment(this.counter));
        this.__value(value, false, true, false);
        this.counter++;
    },

    __stop() {
        if (this.isDestroyed) {
            return;
        }
        if (!this.spinning) {
            return;
        }

        this.__setActive(this.ui.spinnerButtons, false);
        clearTimeout(this.timer);
        clearTimeout(this.mousewheelTimer);
        this.counter = 0;
        this.spinning = false;
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
                value = this.__adjustRange(parsed);
                if (!this.options.allowFloat) {
                    value = Math.floor(value);
                }
                if (this.options.format) {
                    formattedValue = numeral(value).format(this.options.format);
                    value = numeral._.stringToNumber(formattedValue);
                }
            } else {
                return;
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
        if (!suppressRender) {
            if (formattedValue) {
                this.ui.input.val(formattedValue);
            } else {
                this.ui.input.val(value);
            }
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __parse(value) {
        let val = value;
        if (typeof val === 'string' && val !== '') {
            if (numeral.localeData().delimiters.decimal !== '.') {
                val = val.replace('.', numeral.localeData().delimiters.decimal);
            }
            val = numeral._.stringToNumber(val);
            if (val === Number.POSITIVE_INFINITY) {
                val = Number.MAX_VALUE;
            } else if (val === Number.NEGATIVE_INFINITY) {
                val = Number.MIN_VALUE;
            }
        }
        return val === '' || isNaN(val) ? null : val;
    },

    __precision() {
        let precision = this.__precisionOf(constants.STEP);
        if (this.options.min !== null) {
            precision = Math.max(precision, this.__precisionOf(this.options.min));
        }
        return precision;
    },

    __precisionOf(num) {
        const str = num.toString();
        const decimal = str.indexOf('.');
        return decimal === -1 ? 0 : str.length - decimal - 1;
    },

    __increment(i) {
        const incremental = constants.INCREMENTAL;
        if (incremental) {
            return $.isFunction(incremental) ?
                incremental(i) :
                Math.floor(i * i * i / 50000 - i * i / 500 + 17 * i / 200 + 1);
        }
        return 1;
    },

    __adjustRange(value) {
        const options = this.options;
        if (options.max !== null && value > options.max) {
            return options.max;
        }
        if (options.min !== null && value < options.min) {
            return options.min;
        }
        return value;
    },

    __adjustValue(value) {
        const options = this.options;
        const base = options.min !== null ? options.min : 0;
        let aboveMin;

        // make sure we're at a valid step
        // - find out where we are relative to the base (min or 0)
        aboveMin = value - base;
        // - round to the nearest step
        aboveMin = Math.round(aboveMin / constants.STEP) * constants.STEP;
        // - rounding is based on 0, so adjust back to our base
        // fix precision from bad JS floating point math
        return parseFloat((base + aboveMin).toFixed(this.__precision()));
    },

    setValue(value) {
        this.__value(value, false, false, false);
    },

    isEmptyValue() {
        return !_.isNumber(this.getValue());
    },

    __onMouseenter() {
        this.el.insertAdjacentHTML('beforeend', this.value ? iconWrapRemove : iconWrapNumber);
    },

    __onMouseleave() {
        this.el.removeChild(this.el.lastElementChild);
    }
});

export default formRepository.editors.Number;
