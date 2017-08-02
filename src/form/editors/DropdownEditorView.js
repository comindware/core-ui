/**
 * Developer: Stepan Burguchev
 * Date: 1/16/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars, keypress } from 'lib';
import list from 'list';
import dropdown from 'dropdown';
import template from './templates/dropdownEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DropdownPanelView from './impl/dropdown/views/DropdownPanelView';
import DropdownButtonView from './impl/dropdown/views/DropdownButtonView';
import formRepository from '../formRepository';

const classes = {
};

const defaultOptions = {
    collection: null,
    displayAttribute: 'text',
    allowEmptyValue: true,
    enableSearch: false
};

/**
 * @name DropdownEditorView
 * @memberof module:core.form.editors
 * @class Dropdown editor that allows to select a value from a list. Тип данных редактируемого значения должен
 * совпадать с типом данных поля <code>id</code> элементов коллекции <code>collection</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.allowEmptyValue=true] Whether to allow <code>null</code> value to be set.
 * @param {Backbone.Collection|Array} options.collection Массив объектов <code>{ id, text }</code> или
 * Backbone коллекция моделей с такими атрибутами. Используйте свойство <code>displayAttribute</code> для отображения
 * текста из поля, отличного от <code>text</code>. В случае передачи Backbone.Collection, дальнейшее ее изменение
 * отражается в выпадающем списке.
 * @param {String} [options.displayAttribute='text'] The name of the attribute that contains display text.
 * @param {Boolean} [options.enableSearch=false] Whether to display search bar in the dropdown panel.
 * */
formRepository.editors.Dropdown = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.DropdownEditorView.prototype */{
    initialize(options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        _.bindAll(this, '__onCollectionChange');

        this.reqres = new Backbone.Wreqr.RequestResponse();

        this.reqres.setHandler('value:set', this.onValueSet, this);
        this.reqres.setHandler('panel:open', this.onPanelOpen, this);

        if (_.isArray(this.options.collection)) {
            this.options.collection = new Backbone.Collection(this.options.collection);
        }

        this.collection = this.options.collection;

        // adding ListItem behavior to collection model
        const fixModel = function(model) {
            _.extend(model, new list.models.behaviors.ListItemBehavior(model));
        };
        this.collection.each(fixModel);
        const oldModel = this.collection.model;
        this.collection.model = oldModel.extend({
            initialize() {
                oldModel.prototype.initialize.apply(this, arguments);
                fixModel(this);
            }
        });

        this.listenTo(this.collection, 'add', this.__onCollectionChange);
        this.listenTo(this.collection, 'remove', this.__onCollectionChange);
        this.listenTo(this.collection, 'reset', this.__onCollectionChange);

        this.viewModel = new Backbone.Model({
            button: new Backbone.Model({
                value: this.__findModel(this.getValue()),
                displayAttribute: this.options.displayAttribute
            }),
            panel: new Backbone.Model({
                collection: this.collection,
                value: this.__findModel(this.getValue()),
                displayAttribute: this.options.displayAttribute
            })
        });
    },

    focusElement: '.js-dropdown-region',

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'dropdown-view editor',

    template: Handlebars.compile(template),

    setValue(value) {
        this.__value(value, false);
    },

    onRender() {
        this.__assignKeyboardShortcuts();
        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: DropdownButtonView,
            buttonViewOptions: {
                model: this.viewModel.get('button'),
                reqres: this.reqres,
                allowEmptyValue: this.options.allowEmptyValue
            },
            panelView: DropdownPanelView,
            panelViewOptions: {
                model: this.viewModel.get('panel'),
                reqres: this.reqres,
                enableSearch: this.options.enableSearch
            },
            autoOpen: false
        });
        this.listenTo(this.dropdownView, 'close', this.onBlur);
        this.listenTo(this.dropdownView, 'panel:cancel', this.__onCancel);
        this.dropdownRegion.show(this.dropdownView);
    },

    __onCollectionChange() {
        const value = this.getValue();
        const valueModel = this.collection.findWhere({ id: value });
        if (valueModel !== null) {
            if (valueModel !== this.viewModel.get('button').get('value')) {
                this.viewModel.get('button').set('value', valueModel);
            }
            if (valueModel !== this.viewModel.get('panel').get('value')) {
                this.viewModel.get('panel').set('value', valueModel);
            }

            return;
        }

        if (this.options.allowEmptyValue || this.collection.length === null) {
            this.setValue(null);
        } else {
            this.setValue(this.collection.at(0).id);
        }
    },

    __findModel(value) {
        return this.collection ? this.collection.findWhere({ id: value }) : null;
    },

    __assignKeyboardShortcuts() {
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.el);
        _.each('enter,num_enter,down'.split(','), function(key) {
            this.keyListener.simple_combo(key, () => {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            });
        }, this);
        this.keyListener.simple_combo('esc', () => {
            if (this.getEnabled() && !this.getReadonly()) {
                this.dropdownView.close();
            }
        });
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled()) {
            this.__getFocusElement().prop('tabindex', readonly ? -1 : 0);
        }
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        const valueModel = this.__findModel(value) || null;
        this.viewModel.get('button').set('value', valueModel);
        this.viewModel.get('panel').set('value', valueModel);
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    onValueSet(o) {
        this.__value(o ? o.id : null, true);
        this.dropdownView.close();
        this.focus();
    },

    onPanelOpen() {
        if (this.getEnabled() && !this.getReadonly()) {
            this.dropdownView.open();
        }
    },

    blur() {
        this.dropdownView.close();
    },

    __onCancel() {
        this.dropdownView.close();
        this.focus();
    }
});

export default formRepository.editors.Dropdown;
