/**
 * Developer: Ksenia Kartvelishvili
 * Date: 15.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from '../../libApi';
import dropdown from '../../dropdown/dropdownApi';
import { helpers, comparators } from '../../utils/utilsApi';
import template from './templates/membersBubbleEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import MemberModel from './impl/common/members/models/MemberModel';
import FakeInputModel from './impl/membersBubble/models/FakeInputModel';
import MembersCollection from './impl/common/members/collections/MembersCollection';
import ButtonView from './impl/membersBubble/views/ButtonView';
import factory from './impl/common/members/services/factory';
import formRepository from '../formRepository';

const defaultOptions = {
    exclude: [],
    maxQuantitySelected: null,
    canDeleteMember: true
};

/**
 * @name MembersBubbleEditorView
 * @memberof module:core.form.editors
 * @class Редактор для выбора коллекции пользователей. Поддерживаемый тип данных: массив идентификаторов пользователей
 * (<code>String[]</code>). Например, <code>[ 'user.1', 'user.2', 'user.3' ]</code>. Список доступных пользователей
 * береться из <code>core.services.CacheService</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} [options.canDeleteMember=true] Возможно ли удалять добавленных пользователей.
 * @param {String[]} [options.exclude] Массив идентификаторов пользователей, которые будут скрыты из списка доступных для выбора.
 * @param {Number} [options.maxQuantitySelected] Максимальное количество пользователей, которое можно выбрать.
 * */
formRepository.editors.MembersBubble = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.MembersBubbleEditorView.prototype */{
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

    className: 'editor editor_bubble',

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    onRender: function () {
        if (this.dropdownView) {
            this.stopListening(this.dropdownView);
        }
        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: ButtonView,
            buttonViewOptions: {
                model: this.viewModel,
                reqres: this.reqres,
                enabled: this.getEnabled() && !this.getReadonly() && this.options.canDeleteMember
            },
            panelView: factory.getMembersListView(),
            panelViewOptions: {
                collection: this.viewModel.get('available')
            },
            autoOpen: false
        });
        this.dropdownRegion.show(this.dropdownView);
        this.listenTo(this.dropdownView, 'before:open', this.__onBeforeDropdownOpen);
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.__onDropdownClose);
        this.listenTo(this.dropdownView, 'panel:member:select', this.__onMemberSelect);
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
        this.viewModel.get('available').applyTextFilter(value);
    },

    __onInputSearch: function (value) {
        this.__applyFilter(value);
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

    __onBeforeDropdownOpen: function () {
        this.__applyFilter();
    },

    __onDropdownOpen: function () {
        this.viewModel.get('available').selectFirst();
        this.__focusButton();
        this.onFocus();
    },

    __onDropdownClose: function () {
        this.onBlur();
    },

    __onButtonClick: function () {
        if (this.__canAddMember()) {
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

        var membersCollection = factory.createMembersCollection();
        var members = membersCollection.reduce(function (memo, model) {
            memo[model.id] = model.toJSON();
            return memo;
        }, {});

        this.viewModel.set('members', members);
        var availableModels = new MembersCollection(new Backbone.Collection([], {
            model: MemberModel
        }), {
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name')
        });
        this.viewModel.set('available', availableModels);

        var selectedModels = new Backbone.Collection([], {
            model: MemberModel,
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name')
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
        availableModels.deselect();
        availableModels.remove(selectedModel);
        selectedModels.add(selectedModel, {at: selectedModels.length - 1});
        availableModels.selectFirst();

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

        return this.getEnabled() && !this.getReadonly() &&
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
    },

    __setEnabled: function (enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        var isEnabled = this.getEnabled() && !this.getReadonly() && this.options.canDeleteMember;
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    __setReadonly: function (readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        var isEnabled = this.getEnabled() && !this.getReadonly() && this.options.canDeleteMember;
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    focusElement: null,

    focus: function () {
        if (this.__canAddMember()) {
            this.dropdownView.open();
        }
    },

    blur: function () {
        this.dropdownView.close();
    }
});

export default formRepository.editors.MembersBubble;
