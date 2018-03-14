// @flow
import { keypress } from 'lib';
import { helpers } from 'utils';
import LocalizationService from '../../services/LocalizationService';
import BaseItemEditorView from './base/BaseItemEditorView';
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
    allowEmptyValue: true
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
    initialize(options = {}) {
        const defOps = defaultOptions();
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defOps)), defOps);

        this.placeholder = this.options.emptyPlaceholder;
    },

    onShow() {
        if (this.options.mask) {
            this.$el.inputmask(
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
        clearButton: '.js-clear-button'
    },

    className: 'editor input input_text js-input',

    tagName: 'input',

    attributes() {
        return {
            type: 'text',
            placeholder: this.model.get('placeholder'),
            maxLength: this.model.get('maxLength') || null,
            title: this.model.get('title'),
            id: this.model.get('fieldId')
        };
    },

    template: false,

    templateHelpers() {
        return _.extend(this.options, {
            title: this.value || ''
        });
    },

    events: {
        keyup: '__keyup',
        change: '__change',
        'click @ui.clearButton': '__clear',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave'
    },

    __keyup() {
        if (this.options.changeMode === changeMode.keydown) {
            this.__value(this.$el.val(), false, true);
        }

        this.trigger('keyup', this);
    },

    __change() {
        this.__value(this.$el.val(), false, true);
    },

    __clear() {
        this.__value(null, true, true);
        this.focus();
        return false;
    },

    setValue(value: string) {
        this.__value(value, true, false);
    },

    setPermissions(enabled: Boolean, readonly: Boolean) {
        BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.setPlaceholder();
    },

    setPlaceholder() {
        if (!this.getEnabled() || this.getReadonly()) {
            this.placeholder = '';
        } else {
            this.placeholder = this.options.emptyPlaceholder;
        }

        this.$el.prop('placeholder', this.placeholder);
    },

    __setEnabled(enabled) {
        BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
        this.$el.prop('disabled', !enabled);
    },

    __setReadonly(readonly) {
        BaseItemEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled()) {
            this.$el.prop('readonly', readonly);
            this.$el.prop('tabindex', readonly ? -1 : 0);
        }
    },

    onRender() {
        const value = this.getValue() || '';
        this.$el.val(value);
        if (this.options.showTitle) {
            this.$el.prop('title', value);
        }
        // Keyboard shortcuts listener
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.$el[0]);
    },

    /**
     * Позволяет добавить callback-функцию на ввод определенной клавиши или комбинации клавиш. Использует метод simple_combo плагина
     * [Keypress](https://dmauro.github.io/Keypress/).
     * @param {String} key Комбинация клавиш или несколько комбинаций, разделенных запятыми.
     * Полный список с названиями клавиш указан в исходном файле плагина:
     * [keypress.coffee](https://github.com/dmauro/Keypress/blob/master/keypress.coffee#L750-912).
     * @param {String} callback Callback-функция, вызываемая по срабатыванию комбо.
     * */
    addKeyboardListener(key, callback) {
        if (!this.keyListener) {
            helpers.throwInvalidOperationError("You must apply keyboard listener after 'render' event has happened.");
        }
        const keys = key.split(',');
        _.each(keys, k => {
            this.keyListener.simple_combo(k, callback);
        });
    },

    __value(value: string, updateUi: Boolean, triggerChange: Boolean) {
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (this.getOption('showTitle')) {
            this.$el.prop('title', value);
        }
        if (updateUi) {
            this.$el.val(value);
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    /**
     * Focuses the editor's input and selects all the text in it.
     * */
    select() {
        this.$el.select();
    },

    deselect() {
        this.$el.deselect();
    },

    __onMouseenter() {
        if (this.options.allowEmptyValue) {
            this.el.insertAdjacentHTML('afterend', this.value ? iconWrapRemove : iconWrapText);
        }
    },

    __onMouseleave() {
        if (this.options.allowEmptyValue) {
            this.el.parentElement.removeChild(this.el.parentElement.lastElementChild);
        }
    }
}));
