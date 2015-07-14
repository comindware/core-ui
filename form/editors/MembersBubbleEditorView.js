/**
 * Developer: Ksenia Kartvelishvili
 * Date: 15.04.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'module/lib',
        'core/dropdown/dropdownApi',
        'core/utils/utilsApi',
        'core/serviceLocator',
        'text!./templates/membersBubbleEditor.html',
        './base/BaseLayoutEditorView',
        './impl/membersBubble/models/MemberModel',
        './impl/membersBubble/models/FakeInputModel',
        './impl/membersBubble/collection/MembersCollection',
        './impl/membersBubble/views/ButtonView',
        './impl/membersBubble/views/PanelView'
    ],
    function (
        lib,
        dropdown,
        utils,
        serviceLocator,
        template,
        BaseLayoutEditorView,
        MemberModel,
        FakeInputModel,
        MembersCollection,
        ButtonView,
        PanelView
    ) {

        'use strict';

        var defaultOptions = {
            exclude: [],
            selected: [],
            maxQuantitySelected: null,
            canDeleteMember: true
        };

        Backbone.Form.editors.MembersBubble = BaseLayoutEditorView.extend({
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }
                _.bindAll(this, '__onDropdownOpen');
                this.__bindReqres();
                this.__createViewModel();
                this.__updateViewModel(this.getValue());
                this.__updateFakeInputModel();
                this.value = this.getValue() || [];
            },

            __bindReqres: function () {
                this.reqres = new Backbone.Wreqr.RequestResponse();
                this.reqres.setHandler('member:select', this.__onMemberSelect, this);
                this.reqres.setHandler('bubble:delete', this.__onBubbleDelete, this);
                this.reqres.setHandler('bubble:delete:last', this.__onBubbleDeleteLast, this);
                this.reqres.setHandler('input:search', this.__onInputSearch, this);
                this.reqres.setHandler('input:up', this.__onInputUp, this);
                this.reqres.setHandler('input:down', this.__onInputDown, this);
                this.reqres.setHandler('button:click', this.__onButtonClick, this);
            },

            template: Handlebars.compile(template),

            regions: {
                dropdownRegion: '.js-dropdown-region'
            },

            onRender: function () {
                if (this.dropdownView) {
                    this.stopListening(this.dropdownView);
                }
                this.__applyFilter();
                this.dropdownView = dropdown.factory.createDropdown({
                    buttonView: ButtonView,
                    buttonViewOptions: {
                        model: this.viewModel,
                        reqres: this.reqres,
                        enabled: this.getEnabled() && this.options.canDeleteMember
                    },
                    panelView: PanelView,
                    panelViewOptions: {
                        model: this.viewModel,
                        reqres: this.reqres
                    },
                    autoOpen: false
                });
                this.dropdownRegion.show(this.dropdownView);
                this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
            },

            setValue: function (value) {
                if (_.isUndefined(value) || value === null) {
                    value = [];
                }
                if ((this.value === value) || (JSON.stringify(this.value) === JSON.stringify(value))) {
                    return;
                }
                this.value = value;
                this.__updateViewModel(value);
                this.__triggerChange();
            },

            __applyFilter: function (value) {
                var collection = this.viewModel.get('available');
                collection.deselect();
                collection.unhighlight();

                if(!value) {
                    collection.filter(null);
                    return;
                }
                value = value.toLowerCase();
                collection.filter(function (model) {
                    var modelName = model.get('name');
                    return modelName && modelName.toLowerCase().indexOf(value) !== -1;
                });
                collection.highlight(value);
            },

            __onInputSearch: function (value) {
                this.__applyFilter(value);
                this.__selectFirstMember(this.viewModel.get('available'));
                this.__onButtonClick();
            },

            __onInputUp: function () {
                var collection = this.viewModel.get('available');
                if (collection.models[0].selected) {
                    this.dropdownView.close();
                    this.__focusButton();
                } else {
                    this.__sendPanelCommand('up');
                }
            },

            __onInputDown: function () {
                if (!this.dropdownView.isOpen) {
                    this.dropdownView.open();
                } else {
                    this.__sendPanelCommand('down');
                }
            },

            __onDropdownOpen: function () {
                this.__selectFirstMember(this.viewModel.get('available'));
                this.__focusButton();
            },

            __selectFirstMember: function (collection) {
                if (collection.models.length !== 0) {
                    collection.models[0].select();
                }
            },

            __onButtonClick: function () {
                if (this.__canAddMember() && !this.dropdownView.isOpen) {
                    this.dropdownView.open();
                }
            },

            __sendPanelCommand: function (command, options) {
                if (this.dropdownView.isOpen) {
                    this.dropdownView.panelView.handleCommand(command, options);
                }
            },

            __createViewModel: function () {
                this.viewModel = new Backbone.Model();
                var users = serviceLocator.cacheService.GetUsers();
                var members = {};

                _.each(users, function(model) {
                    //noinspection JSUnresolvedVariable
                    members[model.Id] = {
                        id: model.Id,
                        name: (model.Text || model.Username),
                        abbreviation: model.abbreviation,
                        userpicUrl: model.userpicUrl,
                        link: model.link
                    };
                });
                this.viewModel.set('members', members);

                var availableModels = new MembersCollection(new Backbone.Collection([], {
                    model: MemberModel
                }), {
                    comparator: utils.helpers.comparatorFor(utils.comparators.stringComparator2Asc, 'name')
                });
                this.viewModel.set('available', availableModels);

                var selectedModels = new Backbone.Collection([], {
                    model: MemberModel,
                    comparator: utils.helpers.comparatorFor(utils.comparators.stringComparator2Asc, 'name')
                });
                this.viewModel.set('selected', selectedModels);
            },

            __updateViewModel: function (selectedValues) {
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
                var selectedMembers = _.filter (
                    this.viewModel.get('selected').models,
                    function (model) {
                        return model !== this.fakeInputModel;
                    }.bind(this));

                return this.getEnabled() &&
                    (!this.options.maxQuantitySelected || (this.options.maxQuantitySelected !== selectedMembers.length)) &&
                    this.viewModel.get('available').length > 0;
            },

            __onBubbleDelete: function (model) {
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
                if (this.dropdownView.button) {
                    this.dropdownView.button.updateInput();
                }
            },

            __focusButton: function () {
                if (this.dropdownView.button) {
                    this.dropdownView.button.focus();
                }
            },

            __onBubbleDeleteLast: function () {
                var selectedModels = this.viewModel.get('selected');
                var model = selectedModels.models[selectedModels.models.length - 2];
                this.__onBubbleDelete(model);
            }
        });

        return Backbone.Form.editors.MembersBubble;
    });
