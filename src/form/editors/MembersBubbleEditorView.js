/**
 * Developer: Ksenia Kartvelishvili
 * Date: 15.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import dropdown from 'dropdown';
import { helpers, comparators } from 'utils';
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
    maxQuantitySelected: undefined,
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
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);
        _.bindAll(this, '__onDropdownOpen');
        this.__bindReqres();
        this.__createViewModel();
        this.__updateViewModel(this.getValue());
        this.__updateFakeInputModel();
        this.textFilterDelay = this.options.textFilterDelay || 0;
        this.fetchDelayId = _.uniqueId('fetch-delay-id-');
        this.value = this.getValue() || [];
    },

    __bindReqres() {
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

    onRender() {
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

    setValue(value = []) {
        if ((this.value === value) || (JSON.stringify(this.value) === JSON.stringify(value))) {
            return;
        }
        this.value = value;
        this.__updateViewModel(value);
        this.__triggerChange();
    },

    __applyFilter(value, immediate) {
        const applyFilter = () => this.viewModel.get('available').applyTextFilter(value);
        if (immediate) {
            applyFilter();
        } else {
            helpers.setUniqueTimeout(this.fetchDelayId, applyFilter, this.textFilterDelay);
        }
    },

    __onInputSearch(value) {
        this.__applyFilter(value);
        this.__onButtonClick();
    },

    __onInputUp() {
        const collection = this.viewModel.get('available');
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

    __onBeforeDropdownOpen() {
        this.__applyFilter(undefined, true);
    },

    __onDropdownOpen() {
        this.viewModel.get('available').selectFirst();
        this.__focusButton();
        this.onFocus();
    },

    __onDropdownClose() {
        this.onBlur();
    },

    __onButtonClick() {
        if (this.__canAddMember()) {
            this.dropdownView.open();
        }
    },

    __sendPanelCommand(command, options) {
        if (this.dropdownView.isOpen) {
            this.dropdownView.panelView.handleCommand(command, options);
        }
    },

    __createViewModel() {
        this.viewModel = new Backbone.Model();

        const membersCollection = factory.createMembersCollection();
        const members = membersCollection.reduce((memo, model) => {
            memo[model.id] = model.toJSON();
            return memo;
        }, {});

        this.viewModel.set('members', members);
        const availableModels = new MembersCollection(new Backbone.Collection([], {
            model: MemberModel
        }), {
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name')
        });
        this.viewModel.set('available', availableModels);

        const selectedModels = new Backbone.Collection([], {
            model: MemberModel,
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name')
        });
        this.viewModel.set('selected', selectedModels);
    },

    __updateViewModel(selectedValues) {
        const members = _.clone(this.viewModel.get('members'));
        this.options.exclude.forEach(id => {
            if (members[id]) {
                delete members[id];
            }
        });
        const selectedMembers = selectedValues
            ? selectedValues.map(id => {
                const model = members[id];
                delete members[id];
                return model;
            })
            : [];

        const availableMembers = Object.values(members);
        const availableModels = this.viewModel.get('available');

        availableModels.reset(availableMembers);
        const selectedModels = this.viewModel.get('selected');
        selectedModels.reset(selectedMembers);
    },

    __updateFakeInputModel() {
        const selectedModels = this.viewModel.get('selected');

        if (this.__canAddMember() && !this.fakeInputModel) {
            this.fakeInputModel = new FakeInputModel();
            selectedModels.add(this.fakeInputModel, { at: selectedModels.length });
        }
        if (!this.__canAddMember() && this.fakeInputModel) {
            selectedModels.remove(this.fakeInputModel);
            delete this.fakeInputModel;
        }
        if (this.fakeInputModel) {
            this.fakeInputModel.updateEmpty();
        }
    },

    __onMemberSelect() {
        const canAddMemberOldValue = this.__canAddMember();
        const selectedModels = this.viewModel.get('selected');
        const availableModels = this.viewModel.get('available');
        const selectedModel = availableModels.selected;
        if (!selectedModel) {
            return;
        }
        this.__applyFilter();
        availableModels.deselect();
        availableModels.remove(selectedModel);
        selectedModels.add(selectedModel, { at: selectedModels.length - 1 });
        availableModels.selectFirst();

        this.value = this.getValue().concat(selectedModel.get('id'));
        this.__triggerChange();

        const stopAddMembers = canAddMemberOldValue !== this.__canAddMember();
        this.__updateFakeInputModel();
        if (stopAddMembers) {
            this.dropdownView.close();
        } else {
            this.__updateButtonInput();
            this.__focusButton();
        }
    },

    __canAddMember() {
        const selectedMembers = _.filter(
            this.viewModel.get('selected').models,
            model => model !== this.fakeInputModel);

        return this.getEnabled() && !this.getReadonly() &&
            (!this.options.maxQuantitySelected || (this.options.maxQuantitySelected !== selectedMembers.length)) &&
            this.viewModel.get('available').length > 0;
    },

    __onBubbleDelete(model) {
        if (!model) {
            return;
        }
        if (this.dropdownView) {
            this.dropdownView.close();
        }
        const selectedModels = this.viewModel.get('selected');
        const availableModels = this.viewModel.get('available');
        selectedModels.remove(model);
        availableModels.add(model, { delayed: false });

        const selected = [].concat(this.getValue());
        selected.splice(selected.indexOf(model.get('id')), 1);
        this.value = selected;
        this.__triggerChange();

        this.__updateFakeInputModel();
        this.__focusButton();
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

    __setEnabled(enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        const isEnabled = this.getEnabled() && !this.getReadonly() && this.options.canDeleteMember;
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        const isEnabled = this.getEnabled() && !this.getReadonly() && this.options.canDeleteMember;
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    focus() {
        if (this.__canAddMember()) {
            this.dropdownView.open();
        }
    },

    blur() {
        this.dropdownView.close();
    }
});

export default formRepository.editors.MembersBubble;
