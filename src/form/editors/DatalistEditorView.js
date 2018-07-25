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
    valueType: 'normal',
    showSearch: true,
    class: undefined
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
        this.panelCollection = new VirtualCollection(new ReferenceCollection(collection), {
            isSliding: true,
            selectableBehavior: 'multi'
        });

        this.controller =
            this.options.controller ||
            new StaticController({
                collection: options.collection
            });

        this.value = this.__adjustValue(this.value);
        this.__updateWithDelay = _.debounce(this.__updateFilter, this.options.textFilterDelay);
        this.listenTo(this.panelCollection, 'selected', this.__onValueSet);
        this.listenTo(this.panelCollection, 'deselected', this.__onValueUnset);

        this.viewModel = {
            button: {
                selected: new Backbone.Collection(this.value, {
                    comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'text')
                })
            },
            panel: new Backbone.Model({
                collection: this.panelCollection
            })
        };

        const reqres = Backbone.Radio.channel(_.uniqueId('datalistE'));

        reqres.reply({
            'bubble:delete': this.__onBubbleDelete.bind(this),
            'bubble:delete:last': this.__onBubbleDeleteLast.bind(this),
            'input:search': this.__onInputSearch.bind(this),
            'input:up': this.__onInputUp.bind(this),
            'input:down': this.__onInputDown.bind(this),
            'button:click': this.__onButtonClick.bind(this),
            'value:select': this.__onValueSelect.bind(this),
            'value:edit': this.__onValueEdit.bind(this),
            'add:new:item': this.__onAddNewItem.bind(this),
            'try:value:select': this.__proxyValueSelect.bind(this)
        });

        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: this.options.buttonView,
            buttonViewOptions: {
                model: this.viewModel.button,
                reqres,
                getDisplayText: value => this.__getDisplayText(value, this.options.displayAttribute),
                showEditButton: this.options.showEditButton,
                canDeleteItem: this.options.canDeleteItem,
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
    },

    regions: {
        dropdownRegion: {
            el: '.js-dropdown-region',
            replaceElement: true
        }
    },

    className() {
        _.defaults(this.options, this.options.schema || this.options, defaultOptions);

        const classList = [];
        const maxQuantity = this.options.maxQuantitySelected;

        if (maxQuantity === 1) {
            classList.push('editor_bubble--single');
        }
        if (this.options.showEditButton) {
            classList.push('editor_bubble--edit');
        }
        if (this.options.canDeleteItem) {
            classList.push('editor_bubble--delete');
        }

        return `${this.options.class || ''} editor editor_bubble ${classList.join(' ')}`;
    },

    template: Handlebars.compile(template),

    setValue(value): void {
        this.value = [];
        this.viewModel && this.viewModel.button.selected.reset();
        this.__value(value, false);
        delete this.fakeInputModel;
        this.__updateFakeInputModel();
    },

    onRender(): void {
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
        if (this.getOption('valueType') === 'id') {
            if (this.getOption('maxQuantitySelected') === 1) {
                return Array.isArray(this.value) && this.value.length ? this.value[0].id : this.value && this.value.id;
            }
            return Array.isArray(this.value) && this.value.map(value => (value.id ? value.id : value));
        }
        return this.value;
    },

    setReadonly(readonly: Boolean): void {
        BaseLayoutEditorView.prototype.setReadonly.call(this, readonly);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.collectionView.updateEnabled(isEnabled);
    },

    setEnabled(enabled: Boolean): void {
        BaseLayoutEditorView.prototype.setEnabled.call(this, enabled);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.collectionView.updateEnabled(isEnabled);
    },

    focus(): void {
        this.__onButtonClick();
    },

    blur(): void {
        this.dropdownView.close();
        this.__blurButton();
    },

    updateFilter(value, immediate) {
        this.searchText = (value || '').trim();

        if (immediate) {
            return this.__updateFilter();
        }
        this.isFilterDeayed = true;
        return this.__updateWithDelay();
    },

    __updateFilter() {
        if (this.activeText === this.searchText) {
            return;
        }
        this.activeText = this.searchText;
        this.isFilterDeayed = false;
        return this.__onFilterText();
    },

    __adjustValue(value: DataValue): any {
        if ((typeof value === 'string' || typeof value === 'number') && value) {
            return this.panelCollection.get(value) || [];
        }
        if (_.isUndefined(value) || value === null) {
            return [];
        }
        if (this.getOption('valueType') === 'id' && this.getOption('maxQuantitySelected') > 1) {
            if (Array.isArray(value)) {
                return value.map(v => this.panelCollection.get(v));
            }
            return this.panelCollection.get(value.id ? value.id : value);
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
        this.panelCollection.reset(panelCollection.models);

        if (editorId) {
            const selectedItem = this.panelCollection.find(collectionItem => collectionItem.get('id').toString() === editorId.toString());
            if (selectedItem) {
                this.setValue(selectedItem.toJSON());
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
        } else if (!isSilent) {
            this.__updateButtonInput();
            this.__focusButton();
        }
    },

    __onValueUnset(model: Backbone.Model): void {
        this.__onBubbleDelete(model);
    },

    __canAddItem(): boolean {
        const selectedItems = this.viewModel.button.selected.models.filter(model => model !== this.fakeInputModel);
        const isAccess = this.getEnabled() && !this.getReadonly();
        const maxQuantity = this.options.maxQuantitySelected;

        return isAccess && maxQuantity > selectedItems.length;
    },

    __onValueEdit(value) {
        return this.controller.edit(value);
    },

    __onInputSearch(value, immediate: boolean): void {
        this.updateFilter(value, immediate);
    },

    __onFilterText() {
        this.dropdownView.buttonView.setLoading(true);

        return this.controller.fetch({ text: this.searchText }).then(data => {
            this.panelCollection.reset(data.collection);
            this.panelCollection.totalCount = data.totalCount;

            if (this.panelCollection.length > 0 && this.value) {
                this.value.forEach(value => {
                    const id = value.id ? value.id : value;

                    if (this.panelCollection.has(id)) {
                        this.panelCollection.get(id).select({ isSilent: true });
                    }
                });
            }
            this.dropdownView.buttonView.setLoading(false);
            this.__tryPointFirstRow();
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
        if (this.getEnabled() && !this.getReadonly() && !this.dropdownView.isOpen) {
            const promise = this.updateFilter(null, true);
            if (promise) {
                promise
                    .then(() => {
                        this.dropdownView.open();
                        this.__triggerReady();
                    })
                    .catch(e => {
                        console.error(e.message);
                    });
            } else {
                this.dropdownView.open();
                this.__triggerReady();
            }
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
        const removingModelIndex = selected.findIndex(s => (s && s.id ? s.id : s) === model.get('id'));
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

        if (!this.options.showSearch) {
            if (this.fakeInputModel) {
                selectedModels.remove(this.fakeInputModel);
                delete this.fakeInputModel;
            }
            return;
        }
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
            this.dropdownView.button.collectionView.updateInput();
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
        this.activeText = null;
    },

    __proxyValueSelect() {
        if (this.isFilterDeayed) {
            this.updateFilter(this.searchText, true);
        } else {
            this.__onValueSelect();
        }
    }
}));
