// @flow
import BaseCollectionEditorView from './base/BaseCollectionEditorView';
import RadioButtonView from './impl/radioGroup/views/RadioButtonView';
import RadioGroupCollection from './impl/radioGroup/collections/RadioGroupCollection';
import template from './impl/radioGroup/templates/radioGroup.hbs';
import formRepository from '../formRepository';
import keyCode from '../../utils/keyCode';

const defaultOptions = {
    radioOptions: [{ id: '', displayText: '' }],
    class: undefined
};

/**
 * @name RadioGroupEditorView
 * @memberof module:core.form.editors
 * @class Радио-группа. Возможно выбрать одно значение из возможных
 * (аналогично {@link module:core.form.editors.DropdownEditorView DropdownEditorView}). Тип данных редактируемого значения должен
 * совпадать с типом данных поля <code>id</code> элементов массива <code>radioOptions</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Array} options.radioOptions Массив объектов <code>{ id, displayText, displayHtml, title }</code>, описывающих радио-кнопки.
 * */
formRepository.editors.RadioGroup = BaseCollectionEditorView.extend(
    /** @lends module:core.form.editors.RadioGroupEditorView.prototype */ {
        initialize(options = {}) {
            this.__applyOptions(options, defaultOptions);
            this.collection = new RadioGroupCollection(this.options.radioOptions);
            this.listenTo(this.collection, 'select:one', this.__onSelectChild);
        },

        template: Handlebars.compile(template),

        childViewContainer: '.js-container',

        childView: RadioButtonView,

        events: {
            keydown: '__onKeyDown'
        },

        childViewOptions() {
            return {
                selected: this.getValue(),
                enabled: this.getEditable()
            };
        },

        isEmptyValue() {
            const value = this.getValue();
            return value == null || value === '';
        },

        __onSelectChild(model) {
            this.__value(model.get('id'), true);
        },

        setValue(value) {
            this.__value(value, false);
        },

        __setEditorEnable(isEnable = this.getEditable()) {
            this.children.each(cv => cv.setEnabled(isEnable));
        },

        __setEnabled(enabled) {
            BaseCollectionEditorView.prototype.__setEnabled.call(this, enabled);
            this.__setEditorEnable();
        },

        __setReadonly(readonly) {
            BaseCollectionEditorView.prototype.__setReadonly.call(this, readonly);
            this.__setEditorEnable();
            if (this.getEnabled()) {
                this.$el.prop('tabindex', readonly ? -1 : 0);
            }
        },

        __value(value, triggerChange) {
            if (this.value === value) {
                return;
            }
            this.value = value;
            this.collection.findWhere({ id: value }).select();
            if (triggerChange) {
                this.__triggerChange();
            }
        },

        __onKeyDown(event) {
            let direction;
            switch (event.keyCode) {
                case keyCode.DOWN:
                    direction = 1;
                    break;
                case keyCode.UP:
                    direction = -1;
                    break;
                default:
                    direction = 0;
            }
            if (direction !== 0) {
                this.__selectNew(direction);
                event.preventDefault();
            }
        },

        __selectNew(direction) {
            const currentElement = this.collection.selected;
            const currentIndex = currentElement ? this.collection.indexOf(currentElement) : -1;
            let newElement = this.collection.at(currentIndex + direction);
            if (!newElement) {
                newElement = direction === 1 ? this.collection.at(0) : this.collection.last();
            }
            newElement.select();
        }
    }
);

export default formRepository.editors.RadioGroup;
