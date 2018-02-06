
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';

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
    template: false,

    tagName: 'input',

    events: {
        change: '__change'
    },

    attributes() {
        return {
            type: 'color'
        };
    },

    __change() {
        this.__value(this.el.value, false, true);
    },

    __clear() {
        this.__value(null, true, true);
        this.focus();
        return false;
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    onRender() {
        const value = this.getValue() || '';
        this.el.value = value;
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
