import { maskInput, emailMask } from 'lib';
import BaseEditorView from './base/BaseEditorView';
import template from './templates/textEditor.hbs';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapText from './iconsWraps/iconWrapText.html';

const changeMode = {
    blur: 'blur',
    keydown: 'keydown'
};

const defaultOptions = () => ({
    changeMode: 'blur',
    maxLength: undefined,
    mask: undefined,
    placeholderChar: '_',
    maskOptions: {},
    showTitle: true,
    allowEmptyValue: true,
    class: undefined,
    format: 'text',
    hideClearButton: false
});

/**
 * @name TextEditorView
 * @memberof module:core.form.editors
 * @class Однострочный текстовый редактор. Поддерживаемый тип данных: <code>String</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number|null} [options.maxLength=null] Максимальное количество символов. Если <code>null</code>, не ограничено.
 * @param {String} [options.changeMode='blur'] Определяет момент обновления значения редактора:<ul>
 *     <li><code>'keydown'</code> - при нажатии клавиши.</li>
 *     <li><code>'blur'</code> - при потери фокуса.</li></ul>
 * @param {String} [options.emptyPlaceholder='Field is empty'] Текст placeholder.
 * @param {String} [options.format=''] ('email'/'tel') set the predefined input mask, validator and type for input.
 * @param {String} [options.mask=null] Если установлено, строка используется как опция <code>mask</code> плагина
 * [jquery.inputmask](https://github.com/RobinHerbots/jquery.inputmask).
 * @param {String} [options.placeholderChar='_'] При установленной опции <code>mask</code>, используется как опция placeholder плагина.
 * @param {Object} [options.maskOptions={}] При установленной опции <code>mask</code>, используется для передачи дополнительных опций плагина.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.Text = BaseEditorView.extend({
    initialize(options) {
        const defOps = defaultOptions();
        if (options.format) {
            this.__setMaskByFormat(options.format, defOps);
        } else {
            this.mask = this.options.mask;
        }
        
        this.__applyOptions(options, defOps);
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        clearButton: '.js-clear-button'
    },

    className: 'editor',

    template: Handlebars.compile(template),

    templateContext() {
        return Object.assign(
            {},
            this.options,
            {
                type: this.options.format === 'tel' ? 'tel' : 'text' 
            }
        );
    },

    events() {
        const events = {
            'keyup @ui.input': '__keyup',
            'change @ui.input': '__change',
            'click @ui.clearButton': '__clear'
        };
        if (!this.options.hideClearButton) {
            events.mouseenter = '__onMouseenter';
        }
        return events;
    },

    onAttach() {
        if (this.mask) {
            this.maskedInputController = maskInput(
                Object.assign(
                    {
                        inputElement: this.ui.input[0],
                        mask: this.mask,
                        placeholderChar: this.options.placeholderChar,
                        autoUnmask: true
                    },
                    this.options.maskOptions || {}
                )
            );
        }
    },

    onDestroy() {
        this.maskedInputController && this.maskedInputController.destroy();
    },

    __keyup() {
        if (this.options.changeMode === changeMode.keydown) {
            this.__value(this.ui.input.val(), false, true);
        }

        this.trigger('keyup', this);
    },

    __change() {
        this.__value(this.ui.input.val(), false, true);
    },

    __clear() {
        this.ui.input.focus();
        this.__value(null, true, false);
        return false;
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    onRender() {
        const value = this.getValue() || '';
        this.ui.input.val(value);
        if (this.options.showTitle) {
            this.ui.input.prop('title', value);
        }
    },

    __value(value, updateUi, triggerChange) {
        let realValue = value;
        if (!updateUi && value && this.options.format === 'tel') {
            realValue = realValue.replace(/[^\d]/g, '');
        }
        if (this.value === realValue) {
            return;
        }
        this.value = realValue;
        this.__updateEmpty();

        if (this.getOption('showTitle')) {
            this.ui.input.prop('title', value);
        }
        if (updateUi) {
            this.ui.input.val(value);
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    /**
     * Focuses the editor's input and selects all the text in it.
     * */
    select() {
        this.ui.input.select();
    },

    deselect() {
        this.ui.input.deselect();
    },

    __onMouseenter() {
        this.$el.off('mouseenter');

        if (!this.options.hideClearButton) {
            this.renderIcons(iconWrapText, iconWrapRemove);
        }
    },

    __setMaskByFormat(format, defaults) {
        let additionalValidator;
        switch (format) {
            case 'email':
                this.mask = emailMask;
                additionalValidator = 'email';
                defaults.emptyPlaceholder = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.EMAILPLACEHOLDER');
                break;
            case 'tel':
                this.mask = [/[1-9]/, ' ', '(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
                defaults.emptyPlaceholder = '5 (555) 555-55-55';
                this.options.maskOptions = {
                    guide: true
                };
                additionalValidator = 'phone';
                break;
            default:
                break;
        }
        if (additionalValidator) {
            if (this.validators) {
                this.validators.push(additionalValidator);
            } else {
                this.validators = [additionalValidator];
            }
        }
    }
}));
