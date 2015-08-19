/**
 * Developer: Stepan Burguchev
 * Date: 8/19/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'text!./templates/mentionEditor.html',
    'module/lib',
    'core/dropdown/dropdownApi',
    'core/utils/utilsApi',
    'core/serviceLocator',
    './base/BaseLayoutEditorView',
    './impl/common/members/services/factory',
    './TextAreaEditorView'
], function (
    template,
    lib,
    dropdown,
    utils,
    serviceLocator,
    BaseLayoutEditorView,
    membersFactory,
    TextAreaEditorView) {
    'use strict';

    var defaultOptions = {
        editorOptions: null
    };

    Backbone.Form.editors.Mention = BaseLayoutEditorView.extend({
        initialize: function (options) {
            if (options.schema) {
                _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
            } else {
                _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
            }

            this.__createViewModel();

            /*_.bindAll(this, '__onDropdownOpen');
            this.__bindReqres();
            this.__updateViewModel(this.getValue());
            this.__updateFakeInputModel();
            this.value = this.getValue() || [];*/
        },

        focusElement: null,

        __createViewModel: function () {
            this.viewModel = new Backbone.Model();
            this.viewModel.set('availableMembers', membersFactory.createMembersCollection());
        },

        template: Handlebars.compile(template),

        regions: {
            dropdownRegion: '.js-dropdown-region'
        },

        onRender: function () {
            if (this.dropdownView) {
                this.stopListening(this.dropdownView);
            }
            this.dropdownView = dropdown.factory.createDropdown({
                buttonView: TextAreaEditorView,
                buttonViewOptions: _.extend({}, this.options.editorOptions || {}, {
                    model: this.model,
                    readonly: this.getReadonly(),
                    enabled: this.getEnabled(),
                    key: this.key,
                    autocommit: this.options.autocommit
                }),
                panelView: membersFactory.getMembersListView(),
                panelViewOptions: {
                    collection: this.viewModel.get('availableMembers')
                },
                autoOpen: false
            });
            this.dropdownRegion.show(this.dropdownView);

            this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
            this.listenTo(this.dropdownView, 'button:change', this.__onTextChange);
            this.listenTo(this.dropdownView, 'button:focus', this.__onFocus);
            this.listenTo(this.dropdownView, 'button:blur', this.__onBlur);
            this.listenTo(this.dropdownView, 'button:input', this.__onInput);

        },

        __onTextChange: function () {
            this.value = this.dropdownView.button.getValue();
            this.__triggerChange();
        },

        __onFocus: function () {
            this.trigger('focus', this);
        },

        __onBlur: function () {
            this.trigger('blur', this);
        },

        __onInput: function (text, caret) {
            if (text.indexOf('@') !== -1) {
                this.dropdownView.open();
            }
        },

        setValue: function (value) {
            this.dropdownView.button.setValue(value);
            this.value = this.dropdownView.button.getValue();
        },

        /*__onInputSearch: function (value) {
            debugger;
            this.__applyFilter(value);
            this.__selectFirstMember(this.viewModel.get('available'));
            this.__onButtonClick();
        },

        __onInputUp: function () {
            debugger;
            var collection = this.viewModel.get('available');
            if (collection.models[0].selected) {
                this.dropdownView.close();
                this.__focusButton();
            } else {
                this.__sendPanelCommand('up');
            }
        },

        __onInputDown: function () {
            debugger;
            if (!this.dropdownView.isOpen) {
                this.dropdownView.open();
            } else {
                this.__sendPanelCommand('down');
            }
        },

        __onDropdownOpen: function () {
            //this.viewModel.get('availableMembers').selectFirst();
            //this.__selectFirstMember(this.viewModel.get('available'));
            this.__focusButton();
        },

        __onButtonClick: function () {
            debugger;
            if (this.__canAddMember() && !this.dropdownView.isOpen) {
                this.dropdownView.open();
            }
        },

        __sendPanelCommand: function (command, options) {
            if (this.dropdownView.isOpen) {
                this.dropdownView.panelView.handleCommand(command, options);
            }
        },

        __updateViewModel: function (selectedValues) {
            debugger;
            var members = _.clone(this.viewModel.get('members'));
            _.each(this.options.exclude, function (id) {
                if (members[id]) {
                    delete members[id];
                }
            });
            var selectedMembers = _.map(selectedValues, function (id) {
                var model = members[id];
                delete members[id];
                return model;
            });
            var availableMembers = _.values(members);

            var availableModels = this.viewModel.get('available');
            availableModels.reset(availableMembers);
            var selectedModels = this.viewModel.get('selected');
            selectedModels.reset(selectedMembers);
        },

        __updateFakeInputModel: function () {
            debugger;
            var selectedModels = this.viewModel.get('selected');

            if (this.__canAddMember() && !this.fakeInputModel) {
                this.fakeInputModel = new FakeInputModel();
                selectedModels.add(this.fakeInputModel, {at: selectedModels.length});
            }
            if (!this.__canAddMember() && this.fakeInputModel) {
                selectedModels.remove(this.fakeInputModel);
                delete this.fakeInputModel;
            }
            if (this.fakeInputModel) {
                this.fakeInputModel.updateEmpty();
            }
        },

        __onMemberSelect: function () {
            debugger;
            var canAddMemberOldValue = this.__canAddMember();
            var selectedModels = this.viewModel.get('selected');
            var availableModels = this.viewModel.get('available');
            var selectedModel = availableModels.selected;
            if (!selectedModel) {
                return;
            }
            this.__applyFilter();
            availableModels.remove(selectedModel);
            selectedModels.add(selectedModel, {at: selectedModels.length - 1});
            this.__selectFirstMember(availableModels);

            this.value = this.getValue().concat(selectedModel.get('id'));
            this.__triggerChange();

            var stopAddMembers = canAddMemberOldValue !== this.__canAddMember();
            this.__updateFakeInputModel();
            if (stopAddMembers) {
                this.dropdownView.close();
            } else {
                this.__updateButtonInput();
                this.__focusButton();
            }
        },

        __canAddMember: function () {
            debugger;
            var selectedMembers = _.filter (
                this.viewModel.get('selected').models,
                function (model) {
                    return model !== this.fakeInputModel;
                }.bind(this));

            return this.getEnabled() && !this.getReadonly() &&
                (!this.options.maxQuantitySelected || (this.options.maxQuantitySelected !== selectedMembers.length)) &&
                this.viewModel.get('available').length > 0;
        },

        __onBubbleDelete: function (model) {
            debugger;
            if (!model) {
                return;
            }
            if (this.dropdownView) {
                this.dropdownView.close();
            }
            var selectedModels = this.viewModel.get('selected');
            var availableModels = this.viewModel.get('available');
            selectedModels.remove(model);
            availableModels.add(model, { delayed: false });

            var selected = [].concat(this.getValue());
            selected.splice(selected.indexOf(model.get('id')), 1);
            this.value = selected;
            this.__triggerChange();

            this.__updateFakeInputModel();
            this.__focusButton();
        },

        __updateButtonInput: function () {
            debugger;
            if (this.dropdownView.button) {
                this.dropdownView.button.updateInput();
            }
        },

        __focusButton: function () {
            this.dropdownView.button.focus();
        },

        __onBubbleDeleteLast: function () {
            var selectedModels = this.viewModel.get('selected');
            var model = selectedModels.models[selectedModels.models.length - 2];
            this.__onBubbleDelete(model);
        },*/

        __setEnabled: function (enabled) {
            BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
            this.dropdownView.button.setEnabled(enabled);
        },

        __setReadonly: function (readonly) {
            BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
            this.dropdownView.button.setReadonly(readonly);
        }
    });

    return Backbone.Form.editors.Mention;
});
