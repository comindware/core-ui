/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import dropdown from '../../dropdown/dropdownApi';
import template from './templates/multiSelectEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import MultiSelectPanelView from './impl/multiSelect/views/MultiSelectPanelView';
import MultiSelectButtonView from './impl/multiSelect/views/MultiSelectButtonView';

const defaultOptions = {
    collection: null,
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
Backbone.Form.editors.MultiSelect = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.MultiSelectEditorView.prototype */{
    initialize: function(options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        if (_.isArray(this.options.collection)) {
            this.options.collection = new Backbone.Collection(this.options.collection);
        }

        this.collection = this.options.collection;
        var collectionChangeHandler = _.throttle(this.__onCollectionChange, 100, {leading: false});

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

    focusElement: null,

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'multiselect-wrp',

    template: template,

    onRender: function() {
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
        this.listenTo(this.dropdownView, 'button:focus', this.onPanelOpenRequest);

        this.listenTo(this.dropdownView, 'panel:select:all', this.__selectAll);
        this.listenTo(this.dropdownView, 'panel:apply', this.__applyValue);
        this.listenTo(this.dropdownView, 'panel:close', () => this.dropdownView.close());

        this.dropdownRegion.show(this.dropdownView);
    },

    __onCollectionChange: function() {
        this.__trimValues();
        this.__triggerChange();
        this.viewModel.get('button').set('value', this.__findModels(this.getValue()));
        this.__resetValue();
    },

    __onSelect: function(model) {
        this.__select(model);
    },

    __onDeselect: function(model) {
        this.__deselect(model);

        if (!this.options.allowEmptyValue) {
            var valueModels = this.__findModels(this.tempValue) || null;
            if (!(valueModels && valueModels.length)) {
                model.trigger('select', model);
            }
        }
    },

    __select: function(model) {
        model.selected = true;
        this.__setValue(model.id);
    },

    __deselect: function(model) {
        model.selected = false;
        this.__unsetValue(model.id);
    },

    __selectAll: function() {
        this.collection.each(function(model) {
            model.trigger('select', model);
        }.bind(this));
    },

    __deselectAll: function() {
        this.collection.each(function(model) {
            model.trigger('deselect', model);
        }.bind(this));
    },

    __trimValues: function() {
        var values = this.getValue();
        if (values === null) {
            return;
        }

        _.chain(values).
            reject(function(value) {
                return this.collection.get(value);
            }.bind(this)).
            each(function(rejectedValue) {
                values = _.without(values, rejectedValue);
            });

        if (values.length) {
            this.setValue(values);
        } else {
            this.setValue(null);
        }
    },

    __findModels: function(values) {
        return this.collection ? this.collection.filter(function(model) {
            return _.contains(values, model.id);
        }) : null;
    },

    __setValue: function(value) {
        if (_.contains(this.tempValue, value)) {
            return;
        }

        this.tempValue = this.tempValue.concat(value);
    },

    __unsetValue: function(value) {
        if (!_.contains(this.tempValue, value)) {
            return;
        }

        this.tempValue = _.without(this.tempValue, value);
    },

    __value: function (value) {
        this.tempValue = value;
        this.__applyValue();
    },

    __applyValue: function() {
        this.setValue(this.tempValue);
        this.__trimValues();
        this.__triggerChange();
        this.dropdownView.close();
    },

    __resetValue: function() {
        var value = this.getValue();
        this.tempValue = value === null ? [] : value;

        this.collection.each(function(model) {
            delete model.selected;
        });

        var valueModels = this.__findModels(this.tempValue) || null;
        _.each(valueModels, function(valueModel) {
            valueModel.trigger('select', valueModel);
        });
    },

    onPanelOpenRequest: function() {
        if (this.getEnabled() && !this.getReadonly()) {
            this.dropdownView.open();
            this.__resetValue();
        }
    },

    onPanelOpen: function () {
        this.onFocus();
    },

    onPanelClose: function() {
        if (!this.options.explicitApply) {
            this.__applyValue();
        }

        this.viewModel.get('button').set('value', this.__findModels(this.getValue()));
        this.onBlur();
    },

    focus: function () {
        this.onPanelOpenRequest();
    },

    blur: function () {
        this.dropdownView.close();
    }
});

export default Backbone.Form.editors.MultiSelect;
