/**
 * Developer: Ksenia Kartvelishvili
 * Date: 30.08.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars, keypress } from 'lib';
import VirtualCollection from '../../collections/VirtualCollection';
import dropdown from 'dropdown';
import { helpers, comparators } from 'utils';
import template from './templates/referenceBubbleEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import FakeInputModel from './impl/referenceBubble/models/FakeInputModel';
import ButtonView from './impl/referenceBubble/views/ButtonView';
import PanelView from './impl/referenceBubble/views/PanelView';
import DefaultReferenceModel from './impl/reference/models/DefaultReferenceModel';
import ReferenceListItemView from './impl/reference/views/ReferenceListItemView';
import formRepository from '../formRepository';

const ReferenceCollection = Backbone.Collection.extend({
    model: DefaultReferenceModel
});

const classes = {
};

const defaultOptions = {
    displayAttribute: 'text',
    controller: null,
    showAddNewButton: false,
    showEditButton: false,
    buttonView: ButtonView,
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
    initialize(options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        _.bindAll(this, '__getDisplayText');

        this.reqres = new Backbone.Wreqr.RequestResponse();
        this.controller = this.options.controller;
        this.showAddNewButton = this.options.showAddNewButton;

        this.reqres.setHandler('panel:open', this.__onPanelOpenRequest, this);

        this.reqres.setHandler('member:select', this.__onMemberSelect, this);
        this.reqres.setHandler('bubble:delete', this.__onBubbleDelete, this);
        this.reqres.setHandler('bubble:delete:last', this.__onBubbleDeleteLast, this);
        this.reqres.setHandler('input:search', this.__onInputSearch, this);
        this.reqres.setHandler('input:up', this.__onInputUp, this);
        this.reqres.setHandler('input:down', this.__onInputDown, this);
        this.reqres.setHandler('button:click', this.__onButtonClick, this);
        
        this.reqres.setHandler('value:clear', this.__onValueClear, this);
        this.reqres.setHandler('value:set', this.__onValueSet, this);
        this.reqres.setHandler('value:edit', this.__onValueEdit, this);
        this.reqres.setHandler('filter:text', this.__onFilterText, this);
        this.reqres.setHandler('add:new:item', this.__onAddNewItem, this);

        this.value = this.__adjustValue(this.value);
        const selectedModels = new Backbone.Collection(this.getValue(), {
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'text')
        });
        this.fakeInputModel = new FakeInputModel();
        selectedModels.add(this.fakeInputModel, { at: selectedModels.length });
        this.fakeInputModel.updateEmpty();
        
        this.viewModel = new Backbone.Model({
            button: new Backbone.Model({
                selected: selectedModels
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
                createValueUrl: this.controller.createValueUrl.bind(this.controller),
                enabled: this.getEnabled(),
                readonly: this.getReadonly()
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.viewModel.get('panel'),
                reqres: this.reqres,
                showAddNewButton: this.showAddNewButton,
                listItemView: this.options.listItemView,
                getDisplayText: this.__getDisplayText,
                textFilterDelay: this.options.textFilterDelay//,
                //hideSearchBar: schema ? schema.hideSearchBar : false
            },
            autoOpen: false
        });
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.onBlur);
        this.listenTo(this.dropdownView, 'panel:cancel', this.__onCancel);
        this.dropdownRegion.show(this.dropdownView);

        // hotkeys
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.el);
        _.each('down,enter,num_enter'.split(','), function(key) {
            this.keyListener.simple_combo(key, () => {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            });
        }, this);

        if (this.options.showTitle) {
            const value = this.getValue();
            this.$el.prop('title', value && value.text ? value.text : '');
        }
    },

    __adjustValue(value) {
        if (_.isUndefined(value) || value === null) {
            return [];
        }
        return value;
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = this.__adjustValue(value);
        this.viewModel.get('button').get('selected').reset(this.value);
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

    __onInputSearch(value, immediate) {
        this.dropdownView.panelView.updateFilter(value, immediate);
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

    __onDropdownOpen() {
        debugger;
        //this.viewModel.get('available').selectFirst();
        this.__focusButton();
        this.onFocus();
    },

    __focusButton() {
        if (this.dropdownView.button) {
            this.dropdownView.button.focus();
        }
    },

    setReadonly(readonly) {
        //noinspection Eslint
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    setEnabled(enabled) {
        //noinspection Eslint
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    focus() {
        debugger;
        this.dropdownView.open();
    },

    blur() {
        this.dropdownView.close();
    },

    __onCancel() {
        this.dropdownView.close();
        this.$el.focus();
    },

    __onButtonClick() {
        this.dropdownView.open();
    },

    __onBubbleDelete(model) {
        if (!model) {
            return;
        }
        if (this.dropdownView) {
            this.dropdownView.close();
        }
        const selectedModels = this.viewModel.get('button').get('selected');
        //const availableModels = this.viewModel.get('available');
        selectedModels.remove(model);
        //availableModels.add(model, { delayed: false });

        const selected = [].concat(this.getValue());
        selected.splice(selected.indexOf(model.get('id')), 1);
        this.value = selected;
        this.__triggerChange();

        this.__updateFakeInputModel();
        this.__focusButton();
    },

    __updateFakeInputModel() {
        const selectedModels = this.viewModel.get('button').get('selected');

        if (!this.fakeInputModel) {
            this.fakeInputModel = new FakeInputModel();
            selectedModels.add(this.fakeInputModel, { at: selectedModels.length });
        }
        this.fakeInputModel.updateEmpty();
    },

    __updateButtonInput() {
        if (this.dropdownView.button) {
            this.dropdownView.button.updateInput();
        }
    },

    __focusButton() {
        if (this.dropdownView.button) {
            this.dropdownView.button.focus();
        }
    },

    __onBubbleDeleteLast() {
        const selectedModels = this.viewModel.get('selected');
        const model = selectedModels.models[selectedModels.models.length - 2];
        this.__onBubbleDelete(model);
    },

    __onInputUp() {
        const collection = this.viewModel.get('panel').get('collection');
        if (collection.models[0].selected) {
            this.dropdownView.close();
            this.__focusButton();
        } else {
            this.__sendPanelCommand('up');
        }
    },

    __onInputDown() {
        if (!this.dropdownView.isOpen) {
            this.dropdownView.open();
        } else {
            this.__sendPanelCommand('down');
        }
    },

    __sendPanelCommand(command, options) {
        if (this.dropdownView.isOpen) {
            this.dropdownView.panelView.handleCommand(command, options);
        }
    }
});

export default formRepository.editors.Reference;
