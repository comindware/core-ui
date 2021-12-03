import BaseEditorView from './base/BaseEditorView';
import template from './templates/uriEditor.hbs';
import formRepository from '../formRepository';
import { keyCode } from 'utils';
import _ from 'underscore';

const changeMode = {
    blur: 'blur'
};

const classes = {
    editorDisabled: 'editor_disabled',
    disabled: 'disabled',
    readonly: 'readonly',
    editorReadonly: 'editor_readonly',
    hidden: 'editor_hidden',
    FOCUSED: 'editor_focused',
    EMPTY: 'editor_empty',
    ERROR: 'js-editor_error editor_error error',
    REQUIRED: 'required'
};

/**
 * @name UriEditorView
 * @memberof module:core.form.editors
 * @class Преобразователь текстовой строки в сслку. Поддерживаемый тип входных данных: <code>String</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number|null} [options.allowedUriSchemes=[]] Список схем URI для формирования ссылки.
 * @param {String} [options.changeMode='blur'] Определяет момент обновления значения редактора:<ul>
 *     <li><code>'keydown'</code> - при нажатии клавиши.</li>
 *     <li><code>'blur'</code> - при потери фокуса.</li></ul>
 * @param {String} [options.emptyPlaceholder='Field is empty'] Текст placeholder.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

const CLASS_HIDDEN = 'hidden';

export default formRepository.editors.Uri = BaseEditorView.extend({
    initialize(options) {
        this.errors = [];
        this.validators = options.allowedUriSchemes;
        this.isHiddenInput = false;
        if (this.value) {
            this.validate();
            this.isHiddenInput = true;
            if (this.errors.length === 0) {
                this.href = this.__getHrefFormat(this.validatorOptions);
            }
        }
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        link: '.js-link',
        iconEdit: '.js-icon-edit'
    },

    className: 'editor editor_uri',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            href: this.href,
            classHiddenInput: this.isHiddenInput ? CLASS_HIDDEN : '',
            classHiddenUri: !this.isHiddenInput ? CLASS_HIDDEN : '',
            value: this.value
        };
    },

    events() {
        const events = {
            'keyup @ui.input': '__keyup',
            'change @ui.input': '__change',
            'click @ui.iconEdit': '__editUri'
        };
        return events;
    },

    __keyup(event) {
        if (this.options.changeMode === changeMode.keydown || event.keyCode === keyCode.ENTER) {
            this.__value(this.ui.input.val(), false, true);
        }

        this.trigger('keyup', this);
    },

    __change() {
        this.__value(this.ui.input.val(), false, true);
    },

    __editUri() {
        this.ui.link[0].classList.add('hidden');
        this.ui.input[0].classList.remove('hidden');
        this.ui.iconEdit[0].classList.add('hidden');
        this.onFocus();
    },

    __onClearClick() {
        if (this.__isDoubleClicked) {
            this.__isDoubleClicked = false;
            return;
        }
        this.ui.input.focus();
        this.__value(null, true, false);
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    onRender() {
        const value = this.getValue() || '';
        this.ui.input.val(value);
        if (this.options.showTitle) {
            this.ui.input.prop?.('title', value);
        }
    },

    validate() {
        let errors = [];
        const value = this.getValue();
        const validators = this.validators;
        let isValid = false;
        let countValidator = 0;
        if (!validators) {
            return;
        }

        this.validatorOptions = null;
        while (!isValid && countValidator < validators.length) {
            this.validatorOptions = validators[countValidator];
            if (this.validatorOptions) {
                const validator = formRepository.getValidator(this.validatorOptions);
                const error = validator.call(this, value);
                if (error) {
                    errors.push(error);
                } else {
                    errors = [];
                    isValid = true;
                }
            }
            ++countValidator;
        }

        if (this.isRendered() && !this.isDestroyed()) {
            this.$editorEl.toggleClass(classes.ERROR, !!errors.length);
            if (errors.length) {
                this.setError(errors);
            } else {
                this.clearError();
            }
        }

        this.errors = errors;
        if (errors.length) {
            return errors;
        }

        return undefined;
    },

    onBlur(event, options = {}) {
        if (options.triggerChange === undefined || options.triggerChange === true) {
            this.checkChange();
        }
        if (!this.errors.length && this.value) {
            this.__replaceComponent();
        }
        this.editorEl.classList.remove(classes.FOCUSED);
        this.trigger('blur', this, event, options);
    },

    onFocus() {
        this.editorEl.classList.add(classes.FOCUSED);
        this.ui.input[0].focus();
    },

    __replaceComponent() {
        if (!this.validatorOptions) {
            return;
        }
        this.ui.input[0].classList.add('hidden');
        this.ui.link[0].setAttribute('href', this.__getHrefFormat(this.validatorOptions));
        this.ui.link[0].setAttribute('title', this.value);
        this.ui.link[0].text = this.value;
        this.ui.link[0].classList.remove('hidden');
        this.ui.iconEdit[0].classList.remove('hidden');
    },

    __getHrefFormat(type) {
        switch (type) {
            case 'phone': {
                return `callto:${this.value}`;
            }
            case 'mailto': {
                return `mailto:${this.value}`;
            }
            default:
                return this.value;
        }
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.__updateEmpty();

        if (triggerChange) {
            this.__triggerChange();
        }

        if (!this.isRendered()) {
            return;
        }

        if (this.getOption('showTitle')) {
            this.ui.input.prop?.('title', value);
        }
        if (updateUi) {
            this.__updateInputValue(value);
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

    __updateInputValue(value) {
        this.ui.input.val(value);
    }
});
