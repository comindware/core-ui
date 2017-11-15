/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars, keypress } from 'lib';
import VirtualCollection from '../../collections/VirtualCollection';
import dropdown from 'dropdown';
import template from './templates/referenceEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import ReferenceButtonView from './impl/reference/views/ReferenceButtonView';
import ReferencePanelView from './impl/reference/views/ReferencePanelView';
import DefaultReferenceModel from './impl/reference/models/DefaultReferenceModel';
import ReferenceListItemView from './impl/reference/views/ReferenceListItemView';
import formRepository from '../formRepository';

const ReferenceCollection = Backbone.Collection.extend({
    model: DefaultReferenceModel
});

const defaultOptions = {
    displayAttribute: 'text',
    controller: null,
    showAddNewButton: false,
    showEditButton: false,
    buttonView: ReferenceButtonView,
    listItemView: ReferenceListItemView,
    textFilterDelay: 300,
    showTitle: true
};

/**
 * @name ReferenceEditorView
 * @memberof module:core.form.editors
 * @class Editor to select object in the format <code>{ id, text }</code>, using async fetch for 'options collection'.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {BaseReferenceEditorController} [options.controller=null] Data provider, instance
 * {@link module:core.form.editors.reference.controllers.BaseReferenceEditorController BaseReferenceEditorController}.
 * @param {Boolean} [options.showAddNewButton=false] responsible for displaying button, which providing to user adding new elements.
 * @param {Marionette.ItemView} [options.buttonView=ReferenceButtonView] view to display button (what we click on to show dropdown).
 * @param {Marionette.ItemView} [options.listItemView=ReferenceListItemView] view to display item in the dropdown list.
 * @param {String} [options.displayAttribute='text'] The name of the attribute that contains display text.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */
formRepository.editors.Reference = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.ReferenceEditorView.prototype */{
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, _.keys(defaultOptions)), defaultOptions);

        _.bindAll(this, '__getDisplayText');

        this.reqres = new Backbone.Wreqr.RequestResponse();
        this.controller = this.options.controller;
        this.showAddNewButton = this.options.showAddNewButton;

        this.reqres.setHandler('panel:open', this.__onPanelOpenRequest, this);
        this.reqres.setHandler('value:clear', this.__onValueClear, this);
        this.reqres.setHandler('value:set', this.__onValueSet, this);
        this.reqres.setHandler('value:edit', this.__onValueEdit, this);
        this.reqres.setHandler('filter:text', this.__onFilterText, this);
        this.reqres.setHandler('add:new:item', this.__onAddNewItem, this);

        this.value = this.__adjustValue(this.value);
        this.viewModel = new Backbone.Model({
            button: new Backbone.Model({
                value: this.getValue(),
                state: 'view',
                enabled: this.getEnabled(),
                readonly: this.getReadonly()
            }),
            panel: new Backbone.Model({
                value: this.getValue(),
                collection: new VirtualCollection(new ReferenceCollection([])),
                totalCount: this.controller.totalCount || 0
            })
        });
    },

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'editor editor_reference',

    template: Handlebars.compile(template),

    setValue(value) {
        this.__value(value, false);
    },

    onRender() {
        // dropdown
        const schema = this.getOption('schema');
        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: this.options.buttonView,
            buttonViewOptions: {
                model: this.viewModel.get('button'),
                reqres: this.reqres,
                getDisplayText: this.__getDisplayText,
                showEditButton: this.options.showEditButton,
                createValueUrl: this.controller.createValueUrl.bind(this.controller)
            },
            panelView: ReferencePanelView,
            panelViewOptions: {
                model: this.viewModel.get('panel'),
                reqres: this.reqres,
                showAddNewButton: this.showAddNewButton,
                listItemView: this.options.listItemView,
                getDisplayText: this.__getDisplayText,
                textFilterDelay: this.options.textFilterDelay,
                hideSearchBar: schema ? schema.hideSearchBar : false
            },
            panelPosition: 'down-over',
            autoOpen: false
        });
        this.listenTo(this.dropdownView, 'open', this.onFocus);
        this.listenTo(this.dropdownView, 'close', this.onBlur);
        this.listenTo(this.dropdownView, 'panel:cancel', this.__onCancel);
        this.dropdownRegion.show(this.dropdownView);

        // hotkeys
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.el);
        _.each('down,enter,num_enter'.split(','), key => {
            this.keyListener.simple_combo(key, () => {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            });
        });

        if (this.options.showTitle) {
            const value = this.getValue();
            this.$el.prop('title', value && value.text ? value.text : '');
        }
    },

    __adjustValue(value) {
        if (!value || !value.id) {
            return null;
        }
        return value;
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = this.__adjustValue(value);
        this.viewModel.get('button').set('value', this.value);
        this.viewModel.get('panel').set('value', this.value);

        if (this.options.showTitle) {
            this.$el.prop('title', value && value.text ? value.text : '');
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    isEmptyValue() {
        const value = this.getValue();
        return !value || _.isEmpty(value);
    },

    __onValueClear() {
        this.__value(null, true);
        this.focus();
        return false;
    },

    __onValueSet(model) {
        const value = model ? model.toJSON() : null;
        this.__value(value, true);
        this.dropdownView.close();
        this.$el.focus();
    },

    __onValueEdit() {
        return this.controller.edit(this.getValue());
    },

    __onFilterText(options) {
        const text = (options && options.text) || null;
        this.text = text;
        return this.controller.fetch(options).then(data => {
            if (this.text === text) {
                this.viewModel.get('panel').get('collection').reset(data.collection);
                this.viewModel.get('panel').set('totalCount', data.totalCount);
            }
        });
    },

    __onPanelOpenRequest() {
        if (this.getEnabled() && !this.getReadonly()) {
            this.dropdownView.open();
        }
    },

    __onAddNewItem() {
        this.dropdownView.close();
        this.controller.addNewItem(createdValue => {
            if (createdValue) {
                this.__value(createdValue, true);
            }
        });
    },

    __getDisplayText(value) {
        if (!value) {
            return '';
        }
        return value[this.options.displayAttribute] || `#${value.id}`;
    },

    setReadonly(readonly) {
        //noinspection Eslint
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.viewModel.get('button').set('readonly', this.getReadonly());
    },

    setEnabled(enabled) {
        //noinspection Eslint
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.viewModel.get('button').set('enabled', this.getEnabled());
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.$el.prop('tabindex', readonly ? -1 : 0);
    },

    focus() {
        this.dropdownView.open();
    },

    blur() {
        this.dropdownView.close();
    },

    __onCancel() {
        this.dropdownView.close();
        this.$el.focus();
    }
});

export default formRepository.editors.Reference;
