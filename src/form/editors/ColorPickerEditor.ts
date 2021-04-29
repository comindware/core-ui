import BaseEditorView from './base/BaseEditorView';
import formRepository from '../formRepository';
import 'spectrum-colorpicker';
import colorPicker from './templates/colorPicker.hbs';

const defaultOptions = () => ({
    emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.COLOR.EMPTYPLACEHOLDER')
});

/**
 * @name ColorPickerView
 * @memberof module:core.form.editors
 * @class Однострочный текстовый редактор. Поддерживаемый тип данных: <code>String</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number|null} [options.maxLength=null] Максимальное количество символов. Если <code>null</code>, не ограничено.
 * @param {String} [options.changeMode='blur'] Определяет момент обновления значения редактора:<ul>
 *     <li><code>'keydown'</code> - при нажатии клавиши.</li>
 *     <li><code>'blur'</code> - при потери фокуса.</li></ul>
 * @param {String} [options.emptyPlaceholder='Field is empty'] Текст placeholder.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.ColorPicker = BaseEditorView.extend({
    initialize(options) {
        this.__applyOptions(options, defaultOptions);
    },

    template: Handlebars.compile(colorPicker),

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        colorpicker: '.js-colorpicker',
        clearButton: '.js-clear-button'
    },

    events: {
        change: '__change',
        'change @ui.colorpicker': '__changedColorPicker',
        'change @ui.input': '__changedHex',
        'click @ui.clearButton': '__onClearClickHandler'
    },

    className: 'editor editor_color',

    __changedHex() {
        this.ui.colorpicker.spectrum('set', this.ui.input.val());
    },

    __changedColorPicker() {
        this.ui.input.val(this.ui.colorpicker.val());
    },

    __change() {
        this.__value(this.ui.colorpicker.val(), false, true);
    },

    __onClearClick() {
        if (this.__isDoubleClicked) {
            this.__isDoubleClicked = false;
            return;
        }
        this.__value(null, false, true);
        this.ui.input.val(null);
        this.ui.colorpicker.spectrum('set', null);
        this.focus();
        return false;
    },

    setValue(value: String) {
        this.__value(value, true, false);
    },

    onRender() {
        this.ui.colorpicker.spectrum({
            color: (this.value || '').toString(),
            showInput: true,
            allowEmpty: true,
            showInitial: true,
            preferredFormat: 'hex'
        });
        this.ui.input.val(this.ui.colorpicker.spectrum('get'));
        this.__updateColorPickerEditable();
    },

    setPermissions(enabled, readonly) {
        BaseEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.__updateColorPickerEditable();
    },

    __updateColorPickerEditable() {
        this.ui.colorpicker.spectrum(this.getEditable() ? 'enable' : 'disable');
    },

    __value(value: String, updateUi: Boolean, triggerChange: Boolean) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        if (updateUi) {
            this.ui.input.prop?.('value', value);
            this.__changedHex();
        }

        if (this.getOption('showTitle') && this.isRendered()) {
            this.ui.input.prop?.('title', value);
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    onBeforeDestroy() {
        this.ui.colorpicker.spectrum('destroy');
    }
}));
