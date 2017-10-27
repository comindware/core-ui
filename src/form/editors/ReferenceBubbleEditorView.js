/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import lib from 'lib';

import template from './templates/referenceBubbleEditor.html';
import ButtonView from './impl/referenceBubble/views/ButtonView';
import FakeInputModel from './impl/referenceBubble/models/FakeInputModel';
import ReferencePanelView from './impl/referenceBubble/views/ReferencePanelView';
import BubbleView from './impl/referenceBubble/views/BubbleView';
import formRepository from '../formRepository';
import DefaultReferenceModel from './impl/reference/models/DefaultReferenceModel';
import ReferenceListItemView from './impl/reference/views/ReferenceListItemView';
import dropdownFactory from '../../dropdown/factory';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';

const defaultOptions = {
    controller: undefined,
    listItemView: ReferenceListItemView,
    displayAttribute: 'text'
};

export default formRepository.editors.ReferenceBubble = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        if (this.value && !_.isArray(this.value)) {
            Core.utils.helpers.throwFormatError('Value must be an array of objects.');
        }

        this.reqres = new Backbone.Wreqr.RequestResponse();

        this.controller = this.options.controller;

        _.bindAll(this, '__getDisplayText');

        this.reqres.setHandler('member:select', this.__onMemberSelect, this);
        this.reqres.setHandler('bubble:delete', this.__onBubbleDelete, this);
        this.reqres.setHandler('bubble:delete:last', this.__onBubbleDeleteLast, this);
        this.reqres.setHandler('input:search', this.__onAutoComplete, this);
        this.reqres.setHandler('value:set', this.__onValueAdd, this);
        this.reqres.setHandler('input:up', this.__onInputUp, this);
        this.reqres.setHandler('input:down', this.__onInputDown, this);
        this.reqres.setHandler('filter:text', this.__onFilterText, this);

        this.__createViewModel();
    },

    __onMemberSelect() {
        const available = this.controller.collection;
        if (available.selected) {
            this.__onValueAdd(available.selected);
        }
    },

    __onValueAdd(model) {
        model.deselect();
        this.controller.collection.remove(model);
        const selected = this.viewModel.get('button').get('selected');
        selected.add(model);
        this.__updateFakeInputModel();
        this.__updateValue(true);
    },

    __updateValue(triggerChange) {
        const selected = this.viewModel.get('button').get('selected');
        this.value = _.map(selected.filter(model => !(model instanceof FakeInputModel)), model => model.toJSON());
        if (triggerChange) {
            this.__triggerChange();
        }
        this.dropdownView.button.focus();
    },

    __onInputUp() {
        const collection = this.controller.collection;
        if (collection.length === 0 || collection.first().selected) {
            this.dropdownView.close();
            this.dropdownView.button.focus();
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
    },

    __onAutoComplete(textFragment) {
        this.dropdownView.open();
        this.__sendPanelCommand('filter', { textFragment });
    },

    __createViewModel() {
        this.viewModel = new Backbone.Model({
            button: new Backbone.Model({
                selected: new Backbone.Collection(this.value || []),
                displayAttribute: this.options.schema.displayAttribute
            }),
            panel: new Backbone.Model({
                collection: this.controller.collection,
                totalCount: this.controller.totalCount || 0
            })
        });
        this.__updateFakeInputModel();
    },

    __onBubbleDelete(model) {
        if (!model) {
            return;
        }
        this.dropdownView.close();
        const selected = this.viewModel.get('button').get('selected');
        selected.remove(model);
        this.__updateValue(true);
    },

    __onBubbleDeleteLast() {
        const selectedModels = this.viewModel.get('button').get('selected');
        const model = selectedModels.models[selectedModels.models.length - 2];
        this.__onBubbleDelete(model);
    },

    focusElement: null,

    attributes: {
        tabindex: 0
    },

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'pr-reference-editor',

    template: Handlebars.compile(template),

    setValue(value) {
        if (value && !_.isArray(value)) {
            Core.utils.helpers.throwFormatError('Value must be an array of objects.');
        }
        this.viewModel.get('button').get('selected').reset(value || []);
        this.__updateFakeInputModel();
        this.__updateValue(false);
    },

    onRender() {
        // dropdown
        this.dropdownView = dropdownFactory.createDropdown({
            buttonView: ButtonView,
            buttonViewOptions: {
                model: this.viewModel.get('button'),
                reqres: this.reqres,
                enabled: this.getEnabled(),
                bubbleView: BubbleView
            },
            panelView: ReferencePanelView,
            panelViewOptions: {
                model: this.viewModel.get('panel'),
                listItemView: this.options.listItemView,
                reqres: this.reqres,
                getDisplayText: this.__getDisplayText
            }
        });

        this.dropdownRegion.show(this.dropdownView);
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);

        // hotkeys
        if (this.keyListener) {
            this.keyListener.reset();
        }

        this.keyListener = new lib.keypress.Listener(this.el);
        _.each('down,enter,num_enter'.split(','), key => {
            this.keyListener.simple_combo(key, () => {
                this.dropdownView.open();
            });
        });
    },

    __onDropdownOpen() {
        this.dropdownView.button.focus();
    },

    __adjustValue(value) {
        if (!value || !value.id) {
            return null;
        }
        if (value instanceof DefaultReferenceModel) {
            return value;
        }
        if (value instanceof Backbone.Model) {
            return new DefaultReferenceModel(value.attributes);
        }

        return new DefaultReferenceModel(value);
    },

    __updateFakeInputModel() {
        const collection = this.viewModel.get('button').get('selected');
        const fakeModel = collection.find(model => model instanceof FakeInputModel);
        if (fakeModel) {
            collection.remove(fakeModel);
        }
        collection.add(new FakeInputModel(), { at: collection.length });
    },

    __onFilterText(options) {
        return this.controller.fetch(options).then(() => {
            this.__excludeSelectedModels(this.controller.collection, this.viewModel.get('button').get('selected').models);
            this.viewModel.get('panel').set('totalCount', this.controller.totalCount);
        });
    },

    __excludeSelectedModels(collection, selectedModels) {
        _.each(selectedModels, model => {
            if (model instanceof FakeInputModel) {
                return;
            }
            collection.remove(model);
        });
    },

    __getDisplayText(value) {
        if (!value) {
            return '';
        }
        return value[this.options.displayAttribute] || `#${value.id}`;
    }
});
