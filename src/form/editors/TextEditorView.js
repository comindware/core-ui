import LocalizationService from '../../services/LocalizationService';
import BaseItemEditorView from './base/BaseItemEditorView';
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
    maskPlaceholder: '_',
    maskOptions: {},
    showTitle: true,
    allowEmptyValue: true,
    class: undefined
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
 * @param {String} [options.mask=null] Если установлено, строка используется как опция <code>mask</code> плагина
 * [jquery.inputmask](https://github.com/RobinHerbots/jquery.inputmask).
 * @param {String} [options.maskPlaceholder='_'] При установленной опции <code>mask</code>, используется как опция placeholder плагина.
 * @param {Object} [options.maskOptions={}] При установленной опции <code>mask</code>, используется для передачи дополнительных опций плагина.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.Text = BaseItemEditorView.extend({
    initialize() {
        this.placeholder = this.options.emptyPlaceholder;
    },

    onAttach() {
        if (this.options.mask) {
            this.ui.input.inputmask(
                Object.assign(
                    {
                        mask: this.options.mask,
                        placeholder: this.options.maskPlaceholder,
                        autoUnmask: true
                    },
                    this.options.maskOptions || {}
                )
            );
        }
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        clearButton: '.js-clear-button'
    },

    className() {
        const defOps = defaultOptions();
        _.defaults(this.options, _.pick(this.options.schema ? this.options.schema : this.options, Object.keys(defOps)), defOps);

        return `${this.options.class || ''} editor`;
    },

    template: Handlebars.compile(template),

    events: {
        'keyup @ui.input': '__keyup',
        'change @ui.input': '__change',
        'click @ui.clearButton': '__clear',
        mouseenter: '__onMouseenter'
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
        BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.setPlaceholder();
    },

    setPlaceholder() {
        if (!this.getEnabled() || this.getReadonly()) {
            this.placeholder = '';
        } else {
            this.placeholder = this.options.emptyPlaceholder;
        }

        this.ui.input.prop('placeholder', this.placeholder);
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

    onRender() {
        const value = this.getValue() || '';
        this.ui.input.val(value);
        if (this.options.showTitle) {
            this.ui.input.prop('title', value);
        }
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
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
    }
}));
