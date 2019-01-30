import { maskInput, emailMask } from 'lib';
import LocalizationService from '../../services/LocalizationService';
import BaseEditorView from './base/BaseEditorView';
import template from './templates/textEditor.hbs';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapText from './iconsWraps/iconWrapText.html';

const changeMode = {
    blur: 'blur',
    keydown: 'keydown'
};

// used as function because Localization service is not initialized yet
const defaultOptions = () => ({
    changeMode: 'blur',
    emptyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.TEXTEDITOR.PLACEHOLDER'),
    maxLength: undefined,
    mask: undefined,
    placeholderChar: '_',
    maskOptions: {},
    showTitle: true,
    allowEmptyValue: true,
    class: undefined,
    format: '',
    readonlyPlaceholder: '-'
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
 * @param {String} [options.format=''] ('email'/'phone') set the predefined input mask and validator
 * @param {String} [options.mask=null] Если установлено, строка используется как опция <code>mask</code> плагина
 * [jquery.inputmask](https://github.com/RobinHerbots/jquery.inputmask).
 * @param {String} [options.placeholderChar='_'] При установленной опции <code>mask</code>, используется как опция placeholder плагина.
 * @param {Object} [options.maskOptions={}] При установленной опции <code>mask</code>, используется для передачи дополнительных опций плагина.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.Text = BaseEditorView.extend({
    initialize() {
        const defOps = defaultOptions();
        const editorOptions = this.options.schema ? this.options.schema : this.options;
        if (editorOptions.format) {
            this.__setMaskByFormat(editorOptions.format, defOps);
        } else {
            this.mask = this.options.mask;
        }
        _.defaults(this.options, _.pick(editorOptions, Object.keys(defOps)), defOps);
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        clearButton: '.js-clear-button'
    },

    className() {
        return `${this.options.class || ''} editor`;
    },

    template: Handlebars.compile(template),

    templateContext() {
        return this.options;
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

    setPermissions(enabled, readonly) {
        BaseEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.__setPlaceholder(this.__placeholderShouldBe());
    },

    __setPlaceholder(placeholder) {
        this.ui.input.prop(
            'placeholder',
            placeholder
        );
    },

    __placeholderShouldBe() {
        return this.getEditable() ?
            this.options.emptyPlaceholder :
            this.options.readonlyPlaceholder;
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

    onRender() {
        const value = this.getValue() || '';
        this.ui.input.val(value);
        if (this.options.showTitle) {
            this.ui.input.prop('title', value);
        }
    },

    __value(value, updateUi, triggerChange) {
        let realValue = value;
        if (!updateUi && value && this.options.format === 'phone') {
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
                defaults.emptyPlaceholder = LocalizationService.get('CORE.FORM.EDITORS.TEXTEDITOR.EMAILPLACEHOLDER');
                break;
            case 'phone':
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
