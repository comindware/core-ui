/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import dropdown from 'dropdown';
import template from './templates/multiSelectEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import MultiSelectPanelView from './impl/multiSelect/views/MultiSelectPanelView';
import MultiSelectButtonView from './impl/multiSelect/views/MultiSelectButtonView';
import formRepository from '../formRepository';

const defaultOptions = {
    collection: undefined,
    displayAttribute: 'text',
    allowEmptyValue: true,
    explicitApply: false
};

/**
 * @name MultiSelectEditorView
 * @memberof module:core.form.editors
 * @class Выпадающая панель с возможность выбора нескольких элементов. Поддерживаемый тип данных: массив объектов, <code>Object[]</code>.
 * Тип объекта в массиве должен совпадать с типом данных поля <code>id</code> элементов коллекции <code>collection</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowEmptyValue=true] Разрешить значение <code>null</code>.
 * @param {Backbone.Collection|Array} options.collection Массив объектов <code>{ id, text }</code> или
 * Backbone коллекция моделей с такими атрибутами. Используйте свойство <code>displayAttribute</code> для отображения
 * текста из поля, отличного от <code>text</code>. В случае передачи Backbone.Collection, дальнейшее ее изменение
 * отражается в выпадающем списке.
 * @param {String} [options.displayAttribute='text'] Имя атрибута, используемого для отображения текста.
 * @param {Boolean} [options.explicitApply=false] Для изменения значения требуется явно нажать кнопку Apply в выпадающей панели.
 * */
formRepository.editors.MultiSelect = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.MultiSelectEditorView.prototype */{
    initialize(options) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, _.keys(defaultOptions)), defaultOptions);

        if (Array.isArray(this.options.collection)) {
            this.options.collection = new Backbone.Collection(this.options.collection);
        }

        this.collection = this.options.collection;
        const collectionChangeHandler = _.throttle(this.__onCollectionChange, 100, { leading: false });

        this.listenTo(this.collection, 'add', collectionChangeHandler);
        this.listenTo(this.collection, 'remove', collectionChangeHandler);
        this.listenTo(this.collection, 'reset', collectionChangeHandler);
        this.listenTo(this.collection, 'select', this.__onSelect);
        this.listenTo(this.collection, 'deselect', this.__onDeselect);

        this.viewModel = new Backbone.Model({
            button: new Backbone.Model({
                collection: this.collection,
                value: this.__findModels(this.getValue())
            }),
            panel: new Backbone.Model({
                collection: this.collection
            })
        });
    },

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'multiselect-wrp',

    template: Handlebars.compile(template),

    onRender() {
        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: MultiSelectButtonView,
            buttonViewOptions: {
                model: this.viewModel.get('button'),
                displayAttribute: this.options.displayAttribute
            },
            panelView: MultiSelectPanelView,
            panelViewOptions: {
                model: this.viewModel.get('panel'),
                displayAttribute: this.options.displayAttribute,
                explicitApply: this.options.explicitApply
            },
            autoOpen: false
        });

        this.listenTo(this.dropdownView, 'close', this.onPanelClose);
        this.listenTo(this.dropdownView, 'open', this.onPanelOpen);

        this.listenTo(this.dropdownView, 'button:open:panel', this.onPanelOpenRequest);
        this.listenTo(this.dropdownView, 'button:value:set', this.__onValueSet);

        this.listenTo(this.dropdownView, 'panel:select:all', this.__selectAll);
        this.listenTo(this.dropdownView, 'panel:apply', this.__applyValue);
        this.listenTo(this.dropdownView, 'panel:close', () => this.dropdownView.close());

        this.dropdownRegion.show(this.dropdownView);
    },

    __onCollectionChange() {
        this.__trimValues();
        this.__triggerChange();
        this.viewModel.get('button').set('value', this.__findModels(this.getValue()));
        this.__resetValue();
    },

    __onValueSet(values) {
        this.__value(values, true);
    },

    __onSelect(model) {
        this.__select(model);
    },

    __onDeselect(model) {
        this.__deselect(model);

        if (!this.options.allowEmptyValue) {
            const valueModels = this.__findModels(this.tempValue) || null;
            if (!(valueModels && valueModels.length)) {
                model.trigger('select', model);
            }
        }
    },

    __select(model) {
        model.selected = true;
        this.__setValue(model.id);
    },

    __deselect(model) {
        model.selected = false;
        this.__unsetValue(model.id);
    },

    __selectAll() {
        this.collection.each(model => {
            model.trigger('select', model);
        });
    },

    __deselectAll() {
        this.collection.each(model => {
            model.trigger('deselect', model);
        });
    },

    __trimValues() {
        let values = this.getValue();
        if (values === null) {
            return;
        }

        _.chain(values)
            .reject(value => this.collection.get(value))
            .each(rejectedValue => {
                values = _.without(values, rejectedValue);
            });

        if (values.length) {
            this.setValue(values);
        } else {
            this.setValue(null);
        }
    },

    __findModels(values) {
        return this.collection ? this.collection.filter(model => _.contains(values, model.id)) : null;
    },

    __setValue(value) {
        if (_.contains(this.tempValue, value)) {
            return;
        }

        this.tempValue = this.tempValue.concat(value);
    },

    __unsetValue(value) {
        if (!_.contains(this.tempValue, value)) {
            return;
        }

        this.tempValue = _.without(this.tempValue, value);
    },

    __value(value, updateUi) {
        this.tempValue = value;
        this.__applyValue();
        if (updateUi) {
            this.viewModel.get('button').set('value', this.__findModels(this.getValue()));
        }
    },

    __applyValue() {
        this.setValue(this.tempValue);
        this.__trimValues();
        this.__triggerChange();
        this.dropdownView.close();
    },

    __resetValue() {
        const value = this.getValue();
        this.tempValue = value === null ? [] : value;

        this.collection.each(model => {
            delete model.selected;
        });

        const valueModels = this.__findModels(this.tempValue) || null;
        _.each(valueModels, valueModel => {
            valueModel.trigger('select', valueModel);
        });
    },

    onPanelOpenRequest() {
        if (this.getEnabled() && !this.getReadonly()) {
            this.dropdownView.open();
            this.__resetValue();
        }
    },

    onPanelOpen() {
        this.onFocus();
    },

    onPanelClose() {
        if (!this.options.explicitApply) {
            this.__applyValue();
        }

        this.viewModel.get('button').set('value', this.__findModels(this.getValue()));
        this.onBlur();
    },

    focus() {
        this.onPanelOpenRequest();
    },

    blur() {
        this.dropdownView.close();
    }
});

export default formRepository.editors.MultiSelect;
