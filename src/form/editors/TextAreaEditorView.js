// @flow
import template from './templates/textAreaEditor.hbs';
import BaseEditorView from './base/BaseEditorView';
import LocalizationService from '../../services/LocalizationService';
import { keyCode, helpers } from 'utils';
import { autosize } from 'lib';
import formRepository from '../formRepository';

const changeMode = {
    blur: 'blur',
    keydown: 'keydown'
};

const size = {
    auto: 'auto',
    fixed: 'fixed'
};

// used as function because Localization service is not initialized yet
const defaultOptions = () => ({
    changeMode: changeMode.blur,
    size: size.auto,
    emptyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.TEXTAREAEDITOR.PLACEHOLDER'),
    readonlyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.TEXTAREAEDITOR.READONLYPLACEHOLDER'),
    disablePlaceholder: LocalizationService.get('CORE.FORM.EDITORS.TEXTAREAEDITOR.DISABLEPLACEHOLDER'),
    maxLength: null,
    height: null,
    minHeight: 1,
    maxHeight: null,
    showTitle: true
});

/**
 * @name TextAreaEditorView
 * @memberof module:core.form.editors
 * @class Multiline text editor. Supported data type: <code>String</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number|null} [options.maxLength=null] The maximum number of characters. Not limited if <code>null</code>.
 * @param {String} [options.changeMode='blur'] Determines the moment the editor's value is updated:<ul>
 *     <li><code>'keydown'</code> - on key press.</li>
 *     <li><code>'blur'</code> - on focus out.</li></ul>
 * @param {String} [options.size='auto'] Determines the strategy to compute the editor's height:<ul>
 *     <li><code>'auto'</code> - determined by the content (withing the range [<code>minHeight</code>, <code>maxHeight</code>]).</li>
 *     <li><code>'fixed'</code> - fixed, determined by <code>height</code> option.</li></ul>
 * @param {String} [options.emptyPlaceholder='Field is empty'] Empty text placeholder.
 * @param {String} [options.readonlyPlaceholder='Field is readonly'] Текст placeholder, отображаемый
 * в случае если эдитор имеет флаг <code>readonly</code>.
 * @param {String} [options.disablePlaceholder='Field is disabled'] Текст placeholder, отображаемый
 * в случае если эдитор имеет флаг <code>enabled: false</code>.
 * @param {Number} [options.height=null] The height of the editor (in rows) when its size is fixed.
 * @param {Number} [options.minHeight=2] The minimum height of the editor (in rows).
 * @param {Number} [options.maxHeight=30] The maximum height of the editor (in rows).
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */
export default (formRepository.editors.TextArea = BaseEditorView.extend({
    initialize(options = {}) {
        const defOps = defaultOptions();
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defOps)), defOps);

        this.placeholder = this.options.emptyPlaceholder;
    },

    focusElement: '.js-textarea',
    className: 'editor editor_textarea',

    ui: {
        textarea: '.js-textarea'
    },

    events: {
        change: '__change',
        'input @ui.textarea': '__input',
        'keyup @ui.textarea': '__keyup'
    },

    template: Handlebars.compile(template),

    templateContext() {
        return this.options;
    },

    onRender() {
        const value = this.getValue() || '';
        this.ui.textarea.val(value);
        if (this.options.showTitle) {
            this.$el.prop('title', value);
        }
        switch (this.options.size) {
            case size.auto:
                this.ui.textarea.attr('rows', this.options.minHeight);
                break;
            case size.fixed:
                this.ui.textarea.attr('rows', this.options.height);
                break;
            default:
                helpers.throwArgumentError('Invalid `size parameter`.');
        }
    },
    onAttach() {
        if (this.options.size === size.auto) {
            if (this.options.maxHeight) {
                const maxHeight = parseInt(this.ui.textarea.css('line-height'), 10) * this.options.maxHeight;
                this.ui.textarea.css('maxHeight', maxHeight);
            }
            autosize(this.ui.textarea);
        }
    },
    setPermissions(enabled, readonly) {
        BaseEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.setPlaceholder();
    },

    setPlaceholder() {
        if (!this.getEnabled()) {
            this.placeholder = this.options.disablePlaceholder;
        } else if (this.getReadonly()) {
            this.placeholder = this.options.readonlyPlaceholder;
        } else {
            this.placeholder = this.options.emptyPlaceholder;
        }

        this.ui.textarea.prop('placeholder', this.placeholder);
    },

    __setEnabled(enabled) {
        //noinspection Eslint
        BaseEditorView.prototype.__setEnabled.call(this, enabled);
        this.ui.textarea.prop('disabled', !enabled);
    },

    __setReadonly(readonly) {
        //noinspection Eslint
        BaseEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled()) {
            this.ui.textarea.prop('readonly', readonly);
            this.ui.textarea.prop('tabindex', readonly ? -1 : 0);
        }
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (this.options.showTitle) {
            this.$el.prop('title', value);
        }
        if (updateUi) {
            this.ui.textarea.val(value);
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    /**
     * Метод позволяет установить позицию курсора.
     * @param {Number} position Новая позиция курсора.
     * */
    setCaretPos(position) {
        this.ui.textarea.selectionStart = position;
        this.ui.textarea.selectionEnd = position;
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    __change() {
        this.__triggerInput();
        this.__value(this.ui.textarea.val(), false, true);
    },

    __input() {
        this.__triggerInput();
        if (this.options.changeMode === changeMode.keydown) {
            this.__value(this.ui.textarea.val(), false, true);
        }
    },

    __keyup(e) {
        if (e.ctrlKey) {
            return;
        }
        if ([keyCode.LEFT, keyCode.RIGHT, keyCode.HOME, keyCode.END].indexOf(e.keyCode) === -1) {
            return;
        }

        const caret = {
            start: this.ui.textarea[0].selectionStart,
            end: this.ui.textarea[0].selectionEnd
        };

        if (this.oldCaret && this.oldCaret.start === caret.start && this.oldCaret.end === caret.end) {
            return;
        }

        this.oldCaret = caret;
        const text = this.ui.textarea.val();
        this.trigger('caretChange', text, caret);
    },

    __triggerInput() {
        const text = this.ui.textarea.val();
        if (this.oldText === text) {
            return;
        }

        this.oldText = text;

        const caret = {
            start: this.ui.textarea[0].selectionStart,
            end: this.ui.textarea[0].selectionEnd
        };

        this.trigger('input', text, {
            start: caret.start,
            end: caret.end
        });
    },

    /**
     * Focuses the editor's input and selects all the text in it.
     * */
    select() {
        this.ui.textarea.select();
    }
}));
