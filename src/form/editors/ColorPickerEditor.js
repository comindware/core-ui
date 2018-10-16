// @flow
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';
import 'spectrum-colorpicker';
import colorPicker from './templates/colorPicker.hbs';

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

export default (formRepository.editors.ColorPicker = BaseItemEditorView.extend({
    template: Handlebars.compile(colorPicker),

    focusElement: '.hexcolor',

    ui: {
        hexcolor: '.hexcolor',
        colorpicker: '.colorpicker'
    },

    events: {
        change: '__change',
        'change @ui.colorpicker': '__changedColorPicker',
        'change @ui.hexcolor': '__changedHex',
        'click .js-clear-button': '__clear'
    },

    className: 'editor editor_color',

    __changedHex() {
        this.ui.colorpicker.spectrum('set', this.ui.hexcolor.val());
    },

    __changedColorPicker() {
        this.ui.hexcolor.val(this.ui.colorpicker.val());
    },

    __change() {
        this.__value(this.ui.colorpicker.val(), false, true);
    },

    __clear() {
        this.__value(null, false, true);
        this.ui.hexcolor.val(null);
        this.ui.colorpicker.spectrum('set', null);
        this.focus();
        return false;
    },

    setValue(value: String) {
        this.__value(value, true, false);
    },

    onAttach() {
        const value = this.getValue() || '';
        this.ui.colorpicker.spectrum({
            color: value.toString(),
            showInput: true,
            allowEmpty: true,
            showInitial: true,
            preferredFormat: 'hex'
        });
        this.ui.hexcolor.val(this.ui.colorpicker.spectrum('get'));
    },

    __setReadonly(readonly) {
        BaseItemEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled() && this.getReadonly()) {
            this.ui.colorpicker.spectrum('disable');
        }
        this.ui.hexcolor.prop('readonly', readonly);
    },

    __setEnabled(enabled) {
        BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
        this.ui.colorpicker.spectrum('enable');
    },

    __value(value: String, updateUi: Boolean, triggerChange: Boolean) {
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (this.getOption('showTitle')) {
            this.ui.input.prop('title', value);
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    onBeforeDestroy() {
        this.ui.colorpicker.spectrum('destroy');
    }
}));
