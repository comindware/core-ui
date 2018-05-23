// @flow
import VirtualCollection from '../../collections/VirtualCollection';
import dropdown from 'dropdown';
import { helpers, comparators } from 'utils';
import template from './templates/datalistEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import FakeInputModel from './impl/datalist/models/FakeInputModel';
import ButtonView from './impl/datalist/views/ButtonView';
import PanelView from './impl/datalist/views/PanelView';
import ReferenceListItemView from './impl/reference/views/ReferenceListItemView';
import formRepository from '../formRepository';
import DefaultReferenceModel from './impl/reference/models/DefaultReferenceModel';
import StaticController from './impl/datalist/controllers/StaticController';

type DataValue = {
    id: string,
    name?: string
};

type DatalistValue = Array<DataValue>;

const ReferenceCollection = Backbone.Collection.extend({
    model: DefaultReferenceModel
});

const defaultOptions = {
    displayAttribute: 'name',
    controller: null,
    showAddNewButton: false,
    showEditButton: false,
    buttonView: ButtonView,
    listItemView: ReferenceListItemView,
    showCheckboxes: false,
    textFilterDelay: 300,
    collection: null,
    maxQuantitySelected: 1,
    canDeleteItem: true,
    valueType: 'normal'
};

/**
 * @name DatalistView
 * @member of module:core.form.editors
 * @class Editor to select object in the format <code>{ id, text }</code>, using async fetch for 'options collection'.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {BaseReferenceEditorController} [options.controller=null] Data provider, instance
 * {@link module:core.form.editors.reference.controllers.BaseReferenceEditorController BaseReferenceEditorController}.
 * @param {Boolean} [options.showAddNewButton=false] responsible for displaying button, which providing to user adding new elements.
 * @param {Marionette.View} [options.buttonView=ReferenceButtonView] view to display button (what we click on to show dropdown).
 * @param {Marionette.View} [options.listView=ReferenceListView] view to display item in the dropdown list.
 * @param {String} [options.displayAttribute='name'] The name of the attribute that contains display text.
 * @param {Boolean} [options.canDeleteItem=true] Возможно ли удалять добавленные бабблы.
 * @param {Number} [options.maxQuantitySelected] Максимальное количество пользователей, которое можно выбрать.
 * @param {String} [options.valueType = 'normal'] type of value (id or [{ id, name }]).
 * */
export default (formRepository.editors.Datalist = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, options.schema || options, defaultOptions);

        let collection = [];
        if (options.collection) {
            if (Array.isArray(options.collection)) {
                collection = options.collection;
            } else {
                collection = options.collection.toJSON();
                this.listenTo(options.collection, 'reset', panelCollection => this.__onResetCollection(panelCollection));
            }
        }
        this.panelCollection = new VirtualCollection(new ReferenceCollection(collection), { selectableBehavior: 'multi' });

        this.controller =
            this.options.controller ||
            new StaticController({
                collection: options.collection
            });

        this.value = this.__adjustValue(this.value);

        this.listenTo(this.panelCollection, 'selected', this.__onValueSet);
        this.listenTo(this.panelCollection, 'deselected', this.__onValueUnset);
    },

    regions: {
        dropdownRegion: {
            el: '.js-dropdown-region',
            replaceElement: true
        }
    },

    className: 'editor editor_bubble',

    template: Handlebars.compile(template),

    setValue(value): void {
        this.value = [];
        this.viewModel.button.selected.reset();
        this.__value(value, false);
        delete this.fakeInputModel;
        this.__updateFakeInputModel();
    },

    onRender(): void {
        const reqres = Backbone.Radio.channel(_.uniqueId('datalistE'));

        this.viewModel = {
            button: {
                selected: new Backbone.Collection(this.value, {
                    comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'text')
                })
            },
            panel: new Backbone.Model({
                value: this.value,
                collection: this.panelCollection,
                totalCount: this.controller.totalCount || 0
            })
        };

        reqres.reply({
            'bubble:delete': this.__onBubbleDelete.bind(this),
            'bubble:delete:last': this.__onBubbleDeleteLast.bind(this),
            'input:search': this.__onInputSearch.bind(this),
            'input:up': this.__onInputUp.bind(this),
            'input:down': this.__onInputDown.bind(this),
            'button:click': this.__onButtonClick.bind(this),
            'value:select': this.__onValueSelect.bind(this),
            'value:edit': this.__onValueEdit.bind(this),
            'filter:text': this.__onFilterText.bind(this),
            'add:new:item': this.__onAddNewItem.bind(this),
            'view:ready': this.__triggerReady.bind(this)
        });

        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: this.options.buttonView,
            buttonViewOptions: {
                model: this.viewModel.button,
                reqres,
                getDisplayText: value => this.__getDisplayText(value, this.options.displayAttribute),
                showEditButton: this.options.showEditButton,
                createValueUrl: this.controller.createValueUrl.bind(this.controller),
                enabled: this.getEnabled(),
                readonly: this.getReadonly()
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.viewModel.panel,
                reqres,
                showAddNewButton: this.options.showAddNewButton,
                showCheckboxes: this.options.showCheckboxes,
                listItemView: this.options.listItemView,
                getDisplayText: value => this.__getDisplayText(value, this.options.displayAttribute),
                textFilterDelay: this.options.textFilterDelay
            },
            autoOpen: false
        });
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.__onDropdownClose);

        this.showChildView('dropdownRegion', this.dropdownView);

        this.__updateFakeInputModel();
    },

    isEmptyValue(): boolean {
        const value = this.getValue();
        if (this.getOption('valueType') === 'id') {
            return !value;
        }
        return !value || !value.length;
    },

    getValue() {
        if (this.getOption('valueType') === 'id' && this.getOption('maxQuantitySelected') === 1) {
            return Array.isArray(this.value) && this.value.length ? this.value[0].id : this.value && this.value.id;
        }
        return this.value;
    },

    setReadonly(readonly: Boolean): void {
        BaseLayoutEditorView.prototype.setReadonly.call(this, readonly);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    setEnabled(enabled: Boolean): void {
        BaseLayoutEditorView.prototype.setEnabled.call(this, enabled);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.updateEnabled(isEnabled);
    },

    focus(): void {
        this.dropdownView.open();
    },

    blur(): void {
        this.dropdownView.close();
        this.__blurButton();
    },

    __adjustValue(value: DataValue): any {
        if ((typeof value === 'string' || typeof value === 'number') && value) {
            return this.panelCollection.get(value) || [{ id: value, text: ' ' }];
        }
        if (_.isUndefined(value) || value === null) {
            return [];
        }
        return value;
    },

    __value(value: DataValue, triggerChange: boolean): void {
        if (JSON.stringify(this.value) === JSON.stringify(value) || (_.isObject(value) && this.value.find(v => v.id === value.id))) {
            this.viewModel.panel.set('value', this.value);
            return;
        }
        const adjustedValue = this.__adjustValue(value);
        const selectedModels = this.viewModel.button.selected;

        if (this.options.maxQuantitySelected === 1) {
            const firstModel = selectedModels.first();
            if (firstModel !== this.fakeInputModel) {
                selectedModels.remove(firstModel);
            }
            this.value = Array.isArray(adjustedValue) ? adjustedValue : [adjustedValue];
        } else {
            this.value = this.getValue().concat(adjustedValue);
        }

        selectedModels.add(this.value, { at: selectedModels.length - 1 });
        this.viewModel.panel.set('value', this.value);

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __onResetCollection(panelCollection) {
        const editorId = this.model.get(this.key);
        if (editorId) {
            this.panelCollection.reset(panelCollection.models);

            const selectedItem = panelCollection.find(collectionItem => collectionItem.get('id').toString() === editorId.toString());
            if (selectedItem) {
                selectedItem.select();
            }
        }
    },

    __onValueSelect(): void {
        if (this.panelCollection.lastPointedModel) {
            this.panelCollection.lastPointedModel.toggleSelected();
        } else {
            this.__onValueSet(this.panelCollection.selected);
        }
    },

    __onValueSet(model?: Backbone.Model, isSilent: boolean = false): void {
        const canAddItemOldValue = this.__canAddItem();
        const value = model ? model.toJSON() : null;
        this.__value(value, true);
        this.__updateFakeInputModel();

        if (this.options.maxQuantitySelected === 1 && !isSilent) {
            this.dropdownView.close();
            this.__updateButtonInput();
            this.__focusButton();
            return;
        }

        const stopAddItems = canAddItemOldValue !== this.__canAddItem();
        if (stopAddItems) {
            this.dropdownView.close();
        } else {
            this.__updateButtonInput();
            this.__focusButton();
        }
    },

    __onValueUnset(model: Backbone.Model): void {
        this.__onBubbleDelete(model);
    },

    __canAddItem(): boolean {
        const selectedItems = _.filter(this.viewModel.button.selected.models, model => model !== this.fakeInputModel);
        const isAccess = this.getEnabled() && !this.getReadonly();
        return isAccess && (this.options.maxQuantitySelected === 1 || !this.options.maxQuantitySelected || this.options.maxQuantitySelected !== selectedItems.length);
    },

    __onValueEdit(value) {
        return this.controller.edit(value);
    },

    __onInputSearch(value, immediate: boolean): void {
        this.__onButtonClick();
        this.dropdownView.panelView.updateFilter(value, immediate);
    },

    __onFilterText(options) {
        const text = (options && options.text) || null;
        this.text = text;
        return this.controller.fetch(options).then(data => {
            if (this.text === text) {
                this.panelCollection.reset(data.collection);
                this.viewModel.panel.set('totalCount', data.totalCount);
                this.__tryPointFirstRow();
            }
        });
    },

    __onAddNewItem(): void {
        this.dropdownView.close();
        this.controller.addNewItem(createdValue => {
            if (createdValue) {
                this.__value(createdValue, true);
            }
        });
    },

    __getDisplayText(value, displayAttribute) {
        if (!value) {
            return '';
        }
        return value[displayAttribute] || value.text || `#${value.id}`;
    },

    __onDropdownOpen(): void {
        this.__focusButton();
        this.onFocus();
    },

    __focusButton(): void {
        if (this.dropdownView.button) {
            this.dropdownView.button.focus();
        }
    },

    __blurButton(): void {
        if (this.dropdownView.button) {
            this.dropdownView.button.blur();
        }
    },

    __onButtonClick(): void {
        if (this.__canAddItem()) {
            this.dropdownView.open();
        }
    },

    __onBubbleDelete(model: Backbone.Model): Backbone.Model {
        if (!model) {
            return;
        }
        this.panelCollection.get(model.id) && this.panelCollection.get(model.id).deselect();

        const selectedModels = this.viewModel.button.selected;
        selectedModels.remove(model);

        const selected = [].concat(this.getValue() || []);
        const removingModelIndex = selected.findIndex(s => (s ? s.id : s) === model.get('id'));
        if (removingModelIndex !== -1) {
            selected.splice(removingModelIndex, 1);
        }
        this.value = selected;
        this.viewModel.panel.set('value', this.value);
        this.__triggerChange();

        this.__updateFakeInputModel();
        this.__focusButton();
        this.__onButtonClick();
    },

    __updateFakeInputModel(): void {
        const selectedModels = this.viewModel.button.selected;

        if (this.__canAddItem() && !this.fakeInputModel) {
            this.fakeInputModel = new FakeInputModel();
            selectedModels.add(this.fakeInputModel, { at: selectedModels.length });
        }
        if (!this.__canAddItem() && this.fakeInputModel) {
            selectedModels.remove(this.fakeInputModel);
            delete this.fakeInputModel;
        }
        if (this.fakeInputModel) {
            this.fakeInputModel.updateEmpty();
        }
    },

    __updateButtonInput(): void {
        if (this.dropdownView.button) {
            this.dropdownView.button.updateInput();
        }
    },

    __onBubbleDeleteLast(): void {
        const selectedModels = this.viewModel.button.selected;
        const model = selectedModels.models[selectedModels.models.length - 2];
        this.__onBubbleDelete(model);
    },

    __onInputUp(): void {
        const collection = this.panelCollection;

        if (collection.indexOf(this.panelCollection.lastPointedModel) === 0) {
            this.dropdownView.close();
            this.__focusButton();
        } else {
            this.__sendPanelCommand('up');
        }
    },

    __onInputDown(): void {
        if (!this.dropdownView.isOpen) {
            this.dropdownView.open();
        } else {
            this.__sendPanelCommand('down');
        }
    },

    __sendPanelCommand(command: string, options: {}): void {
        if (this.dropdownView.isOpen) {
            this.dropdownView.panelView.handleCommand(command, options);
        }
    },

    __triggerReady() {
        this.trigger('view:ready');
        this.__tryPointFirstRow();
    },

    __tryPointFirstRow() {
        if (this.panelCollection.length) {
            this.panelCollection.selectSmart(this.panelCollection.at(0), false, false, false);
        }
    },

    __onDropdownClose() {
        this.onBlur();
        this.panelCollection.pointOff();
    }
}));
