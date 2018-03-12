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
 * @param {String} [options.mask=null] Если установлено, строка используется как опция <code>mask</code> плагина
 * [jquery.inputmask](https://github.com/RobinHerbots/jquery.inputmask).
 * @param {String} [options.maskPlaceholder='_'] При установленной опции <code>mask</code>, используется как опция placeholder плагина.
 * @param {Object} [options.maskOptions={}] При установленной опции <code>mask</code>, используется для передачи дополнительных опций плагина.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default formRepository.editors.ColorPicker = BaseItemEditorView.extend(/** @lends module:core.form.editors.ColorPickerView.prototype */{
    template: Handlebars.compile(colorPicker),

    ui: {
        hexcolor: '.hexcolor',
        colorpicker: '.colorpicker'
    },

    events: {
        change: '__change',
        'change @ui.colorpicker': '__changedColorPicker',
        'change @ui.hexcolor': '__changedHex'

    },

    className: 'editor editor-color',

    __changedHex() {
        if (Core.services.MobileService.isIE) {
            this.ui.colorpicker.spectrum('set', this.ui.hexcolor.val());
        } else {
            this.ui.colorpicker.val(this.ui.hexcolor.val());
        }
    },

    __changedColorPicker() {
        this.ui.hexcolor.val(this.ui.colorpicker.val());
    },

    __change() {
        this.__value(this.ui.colorpicker.val(), false, true);
    },

    __clear() {
        this.__value(null, true, true);
        this.focus();
        return false;
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    onShow() {
        const value = this.getValue() || '';
        if (Core.services.MobileService.isIE) {
            this.ui.colorpicker.spectrum({
                color: value.toString(),
                showInput: true,
                showInitial: true,
                preferredFormat: 'hex'
            });
            this.ui.hexcolor.val(this.ui.colorpicker.spectrum('get'));
        } else {
            this.ui.colorpicker.val(value);
            this.ui.hexcolor.val(this.ui.colorpicker.val());
        }
    },

    __value(value, updateUi, triggerChange) {
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
    }
});
