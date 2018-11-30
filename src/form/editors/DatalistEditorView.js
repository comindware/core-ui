// @flow
import VirtualCollection from '../../collections/VirtualCollection';
import dropdown from 'dropdown';
import { helpers, comparators } from 'utils';
import template from './templates/datalistEditor.hbs';
import BaseEditorView from './base/BaseEditorView';
import FakeInputModel from './impl/datalist/models/FakeInputModel';
import ButtonView from './impl/datalist/views/ButtonView';
import PanelView from './impl/datalist/views/PanelView';
import ReferenceListItemView from './impl/datalist/views/ReferenceListItemView';
import ReferenceListWithSubtextItemView from './impl/datalist/views/ReferenceListWithSubtextItemView';
import formRepository from '../formRepository';
import DefaultReferenceModel from './impl/datalist/models/DefaultReferenceModel';
import StaticController from './impl/datalist/controllers/StaticController';

type DataValue = {
    id: string,
    name?: string,
    text?: string
};

type DatalistValue = Array<DataValue>;

const ReferenceCollection = Backbone.Collection.extend({
    model: DefaultReferenceModel
});

const text2AscComparatorSort = helpers.comparatorFor(comparators.stringComparator2Asc, 'text');

const defaultOptions = {
    displayAttribute: 'name',
    controller: null,
    showAddNewButton: false,
    showEditButton: false,
    buttonView: ButtonView,
    showAdditionalList: false,
    subtextProperty: '',
    iconProperty: '',
    listItemView: ReferenceListItemView,
    listItemViewWithText: ReferenceListWithSubtextItemView,
    showCheckboxes: false,
    textFilterDelay: 300,
    collection: null,
    maxQuantitySelected: 1,
    allowEmptyValue: true,
    canDeleteItem: true,
    valueType: 'normal',
    showSearch: true,
    class: undefined,
    externalBlurHandler: undefined,
    customTemplate: undefined,
    minAvailableHeight: undefined
};
/* Some DOCS
    Datalist value (this.value) is array type. (DatalistValue)
    Datalist fetch [searched] data from controller on click
    __resetPanelVirtualCollection don't work as panelCollection.reset.
    for this you can just reset passed collection.

    ToDo:
    1.Datalist should show value in model on render regardless panelCollection.has. (__adjustValue) (not show in valueType = 'id' mode)
    2.Develop readonly for input (like TextEditorView).
    3.If used fetchUpdateFilter as api, then value added, not reseted.
    5.staticController has no addNewItem function.
    6.If showsearch = false, keyup, keydown not move pointer on panel.
    9.defaultOptions:displayAttribute should be text.
    10.comparator selected collection should be compare for getDisplayText
    11.getDisplayText should has defaults displayAttribute = this.options.displayAttribute.
    13.getDisolayText should return string always. (String(returnedValue))
*/
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
 * @param {String} [options.displayAttribute='name'] The name of the attribute that contains display text or function return display text.
 * @param {Boolean} [options.canDeleteItem=true] Возможно ли удалять добавленные бабблы.
 * @param {Number} [options.maxQuantitySelected] Максимальное количество пользователей, которое можно выбрать.
 * @param {String} [options.valueType = 'normal'] type of value (id or [{ id, name }]).
 * */
export default (formRepository.editors.Datalist = BaseEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, options.schema || options, defaultOptions);
        helpers.ensureOption(options, 'collection');

        let collection = [];
        if (options.collection) {
            if (Array.isArray(options.collection)) {
                collection = options.collection;
            } else {
                collection = options.collection.toJSON();
                this.listenTo(options.collection, 'reset', collect => this.resetCollection(collect));
            }
        }
        this.panelCollection = new VirtualCollection(new ReferenceCollection(collection), {
            isSliding: true,
            selectableBehavior: 'multi'
        });

        this.controller =
            this.options.controller ||
            new StaticController({
                collection: options.collection,
                displayAttribute: options.displayAttribute
            });

        this.value = this.__adjustValue(this.value);
        this.debouncedFetchUpdateFilter = _.debounce(this.fetchUpdateFilter, this.options.textFilterDelay);
        this.listenTo(this.panelCollection, 'selected', this.__onValueSet);
        this.listenTo(this.panelCollection, 'deselected', this.__onValueUnset);

        this.selectedButtonCollection = new Backbone.Collection(this.value, {
            comparator: (a, b) => {
                if (a instanceof FakeInputModel) {
                    return 1;
                }
                if (b instanceof FakeInputModel) {
                    return -1;
                }
                return text2AscComparatorSort(a, b);
            }
        });

        const reqres = Backbone.Radio.channel(_.uniqueId('datalistE'));

        this.reqres = reqres;

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
                collection: this.selectedButtonCollection,
                reqres,
                getDisplayText: value => this.__getDisplayText(value, this.options.displayAttribute),
                showEditButton: this.options.showEditButton,
                customTemplate: this.options.customTemplate,
                canDeleteItem: this.options.maxQuantitySelected > 1 ? this.options.canDeleteItem : this.options.allowEmptyValue,
                createValueUrl: this.controller.createValueUrl.bind(this.controller),
                enabled: this.getEnabled(),
                readonly: this.getReadonly()
            },
            panelView: PanelView,
            panelViewOptions: {
                class: this.options.panelClass,
                collection: this.panelCollection,
                reqres,
                showAddNewButton: this.options.showAddNewButton,
                showCheckboxes: this.options.showCheckboxes,
                listItemView: this.options.showAdditionalList ? this.options.listItemViewWithText : this.options.listItemView,
                getDisplayText: value => this.__getDisplayText(value, this.options.displayAttribute),
                canSelect: () => this.options.maxQuantitySelected === 1 || this.__canAddItem(),
                subTextOptions: {
                    subtextProperty: this.options.subtextProperty,
                    iconProperty: this.options.iconProperty
                },
                textFilterDelay: this.options.textFilterDelay
            },
            autoOpen: false,
            externalBlurHandler: this.options.externalBlurHandler,
            minAvailableHeight: this.options.minAvailableHeight
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
        this.__resetSelectedCollection();
        this.__value(value, false);
    },

    onRender(): void {
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.__onDropdownClose);

        this.showChildView('dropdownRegion', this.dropdownView);

        if (this.selectedButtonCollection) {
            this.__addFakeInputModel(this.selectedButtonCollection);
        }
    },

    isEmptyValue(): boolean {
        const value = this.getValue();
        if (this.getOption('valueType') === 'id') {
            return value == null;
        }
        return value == null || !value.length;
    },

    getValue() {
        if (this.getOption('valueType') === 'id') {
            if (this.getOption('maxQuantitySelected') === 1) {
                return Array.isArray(this.value) && this.value.length ? this.value[0].id : this.value && this.value.id;
            }
            return Array.isArray(this.value) && this.value.map(value => (value && value.id !== undefined ? value.id : value));
        }
        return this.value;
    },

    setReadonly(readonly: Boolean): void {
        BaseEditorView.prototype.setReadonly.call(this, readonly);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.collectionView.updateEnabled(isEnabled);
        this.getInputView()?.setReadonly(readonly);
    },

    setEnabled(enabled: Boolean): void {
        BaseEditorView.prototype.setEnabled.call(this, enabled);
        const isEnabled = this.getEnabled() && !this.getReadonly();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.collectionView.updateEnabled(isEnabled);
        this.getInputView()?.setEnabled(enabled);
    },

    focus(): void {
        this.hasFocus = true;
        this.__focusButton();
        this.onFocus();
    },

    blur(): void {
        this.hasFocus = false;
        this.updateButtonInput('');
        this.__blurButton();
        this.onBlur({
            triggerChange: false
        });
    },

    isButtonFocus() {
        const inputView = this.getInputView();
        return inputView && inputView.ui.input[0] === document.activeElement;
    },

    isThisFocus() {
        return this.el.contains(document.activeElement);
    },

    getInputView() {
        return this.dropdownView?.button?.collectionView?.getInputView();
    },

    async fetchUpdateFilter(value, forceCompareText, openOnRender) {
        this.searchText = (value || '').trim();
        if (this.fakeInputModel?.get('searchText') === this.searchText && !forceCompareText) {
            this.open();
            return;
        }
        this.triggerNotReady();
        this.fakeInputModel?.set('searchText', this.searchText);
        return this.__fetchUpdateFilter(this.searchText, openOnRender);
    },

    async __fetchUpdateFilter(fetchedDataForSearchText, openOnRender) {
        this.panelCollection.pointOff();

        try {
            const complexData = await this.controller.fetch({
                text: fetchedDataForSearchText,
                getDisplayText: editorValue => this.__getDisplayText(editorValue, this.options.displayAttribute)
            });

            if (this.searchText !== fetchedDataForSearchText) {
                throw new Error('searched was updated');
            }

            this.__resetPanelVirtualCollection(complexData);

            this.__tryPointFirstRow();
            this.isLastFetchSuccess = true;
            this.open(openOnRender);
            this.triggerReady(); //don't move to finally, recursively.
            return true;
        } catch (e) {
            this.isLastFetchSuccess = false;
            this.triggerReady();
            return false;
        }
    },

    __resetSelectedCollection(models) {
        if (!this.selectedButtonCollection) {
            return;
        }

        this.selectedButtonCollection.reset(models);
        this.__addFakeInputModel(this.selectedButtonCollection);
    },

    __resetPanelVirtualCollection(rawDataVirtual) {
        this.panelCollection.totalCount = rawDataVirtual.totalCount;
        this.panelCollection.reset(rawDataVirtual.collection);

        if (this.options.maxQuantitySelected === 1) {
            return;
        }

        if (this.panelCollection.length > 0 && this.value) {
            this.value.forEach(editorValue => {
                const id = editorValue && editorValue.id !== undefined ? editorValue.id : editorValue;

                if (this.panelCollection.has(id)) {
                    this.panelCollection.get(id).select({ isSilent: true });
                }
            });
        }
    },

    onAttach() {
        if (this.options.openOnRender) {
            this.__onButtonClick('', false, true);
        }
    },

    adjustPosition(isNeedToRefreshAnchorPosition) {
        if (this.dropdownView) {
            this.dropdownView.adjustPosition(isNeedToRefreshAnchorPosition);
        }
    },

    getIsOpenAllowed() {
        return this.getEnabled() && !this.getReadonly() && !this.dropdownView.isOpen && this.isThisFocus();
    },

    open(openOnRender) {
        if (openOnRender || this.getIsOpenAllowed()) {
            this.dropdownView.open();
            this.__focusButton();
        }
    },

    close() {
        this.dropdownView.close();
    },

    __adjustValue(value: any): DataValue {
        if (value === undefined || value === null) {
            return [];
        }
        const result = this.getOption('valueType') === 'id' ? this.__adjustValueForIdMode(value) : value;
        return Array.isArray(result) ? result : [result];
    },

    __adjustValueForIdMode(value) {
        if (!this.isLastFetchSuccess) {
            this.fetchUpdateFilter('', true);
            this.listenToOnce(this, 'view:ready', () => {
                this.setValue(this.__adjustValueFromLoaded(value).map(item => item.toJSON()));
            });
            return [];
        }
        return this.__adjustValueFromLoaded(value);
    },

    __adjustValueFromLoaded(value) {
        if (Array.isArray(value)) {
            return value.map(v => this.__getValueFromPanelCollection(v));
        }
        return [this.__getValueFromPanelCollection(value)];
    },

    __getValueFromPanelCollection(value) {
        return this.panelCollection.get(value) ||
            (value instanceof Object && this.panelCollection.findWhere(value)) || //backbone get no item with id == null
            this.__tryToCreateAdjustedValue(value);
    },

    __tryToCreateAdjustedValue(value) {
        return value instanceof Backbone.Model ?
            value :
            (value instanceof Object ?
                new Backbone.Model(value) :
                new Backbone.Model({
                    id: value,
                    text: this.__isValueEqualNotSet(value) ?
                        Localizer.get('CORE.COMMON.NOTSET') :
                        undefined
                }));
    },

    __isValueEqualNotSet(value) {
        return value == null || value === 'Undefined';
    },

    isValueIncluded(value) {
        return JSON.stringify(this.value) === JSON.stringify(value) || (value instanceof Object && this.value.find(v => v.id === value.id));
    },

    __value(value: DataValue, triggerChange: boolean): void {
        if (this.isValueIncluded(value)) {
            return false;
        }
        const adjustedValue = this.__adjustValue(value);

        if (this.options.maxQuantitySelected === 1) {
            const firstModel = this.selectedButtonCollection.first();
            if (firstModel !== this.fakeInputModel) {
                this.selectedButtonCollection.remove(firstModel);
            }
            this.value = adjustedValue;
        } else {
            this.value = this.getValue().concat(adjustedValue);
        }

        this.__resetSelectedCollection(this.value);

        if (triggerChange) {
            this.__triggerChange();
        }

        this.__updateFakeInputModel();

        return true;
    },

    resetCollection(collection) {
        const value = this.model ? this.model.get(this.key) : this.value;
        this.panelCollection.reset(collection.models);
        if (value) {
            const selectedItems = this.getOption('valueType') === 'id' ? 
                this.panelCollection.parentCollection.filter(collectionItem => {
                    const itemId = collectionItem.get('id').toString();
                    if (Array.isArray(value)) {
                        return value.find(v => (v && v.id ? v.id : v === itemId));
                    }
                    return value === itemId;
                })
                :
                value.map(item => this.__getValueFromPanelCollection(item));
            if (selectedItems) {
                this.setValue(selectedItems.map(item => item.toJSON()));
                selectedItems.forEach(item => item.select && item.select({ isSilent: true }));
            }
        }
    },

    __onValueSelect(): void {
        if (this.panelCollection.lastPointedModel) {
            this.panelCollection.lastPointedModel.toggleSelected();
        }
    },

    __onValueSet(model?: Backbone.Model, options = {}): void {
        const canAddItemOldValue = this.__canAddItem();
        const value = model ? model.toJSON() : null;

        this.__value(value, true);
        this.__updateFakeInputModel();

        if (this.options.maxQuantitySelected === 1 && !options.isSilent) {
            this.__checkSelectedState(model);
            this.dropdownView.close();
            this.updateButtonInput('');
            this.__focusButton();
            return;
        }

        const stopAddItems = canAddItemOldValue !== this.__canAddItem();
        if (stopAddItems) {
            this.dropdownView.close();
            this.updateButtonInput('');
        } else if (!options.isSilent) {
            this.__focusButton();
            this.__clearSearch();
        }
    },

    __checkSelectedState(model) {
        const selected = Object.values(model.collection.selected);
        if (selected.length > 1) {
            selected.forEach(selectedModel => selectedModel.selected = false);
            model.selected = true;
            model.collection.selected = {
                [model.cid]: model
            };
        }
    },

    __onValueUnset(model: Backbone.Model): void {
        this.__focusButton();
        this.__onBubbleDelete(model);
    },

    __canAddItem(): boolean {
        const selectedItems = this.selectedButtonCollection.models.filter(model => model !== this.fakeInputModel);
        const isAccess = this.getEnabled() && !this.getReadonly();
        const maxQuantity = this.options.maxQuantitySelected;

        return isAccess && maxQuantity > selectedItems.length;
    },

    __onValueEdit(value) {
        return this.controller.edit(value);
    },

    __onInputSearch(value): void {
        this.triggerNotReady();
        this.debouncedFetchUpdateFilter(value);
    },

    __onAddNewItem(): void {
        this.dropdownView.close();
        if (typeof this.controller.addNewItem === 'function') {
            this.controller.addNewItem(createdValue => {
                if (createdValue) {
                    this.__value(createdValue, true);
                }
            });
        }
    },

    __getDisplayText(value, displayAttribute): string {
        if (value == null) {
            return '';
        }
        if (typeof displayAttribute === 'function') {
            return displayAttribute(value);
        }
        return value[displayAttribute] || value.text || `#${value.id}`;
    },

    __focusButton(options): void {
        if (this.dropdownView.button) {
            this.dropdownView.button.focus(options);
        }
    },

    __blurButton(): void {
        if (this.dropdownView.button) {
            this.dropdownView.button.blur();
        }
    },

    __onButtonClick(filterValue = '', forceCompareText = true, openOnRender = false): void {
        this.fetchUpdateFilter(filterValue, forceCompareText, openOnRender);
    },

    __onBubbleDelete(model: Backbone.Model): Backbone.Model {
        if (!model) {
            return;
        }

        if (this.selectedButtonCollection.length === 2 && !this.options.allowEmptyValue) { //length = 1 + fakeInputModel
            return;
        }

        this.panelCollection.get(model.id) && this.panelCollection.get(model.id).deselect();

        this.selectedButtonCollection.remove(model);

        const selected = [].concat(this.getValue() || []);
        const removingModelIndex = selected.findIndex(s => (s && s.id !== undefined ? s.id : s) === model.get('id'));
        if (removingModelIndex !== -1) {
            selected.splice(removingModelIndex, 1);
        }
        this.value = selected;

        this.__triggerChange();

        this.__updateFakeInputModel();

        if (!this.hasFocus) {
            this.__focusButton();
            this.__onButtonClick();
        }
    },

    __updateFakeInputModel(): void {
        this.fakeInputModel && this.fakeInputModel.updateEmpty();
    },

    __addFakeInputModel(collection) {
        if (!this.options.showSearch) {
            if (this.fakeInputModel) {
                collection.remove(this.fakeInputModel);
                delete this.fakeInputModel;
            }
            return;
        }
        collection.add(
            this.isFakeInputModelWrong(collection) ?
                this.fakeInputModel = new FakeInputModel() :
                this.fakeInputModel
        );

        this.__updateFakeInputModel();
    },

    isFakeInputModelWrong(collection) {
        return !this.fakeInputModel || !collection.has(this.fakeInputModel.id);
    },

    updateButtonInput(string): void {
        if (this.dropdownView.button) {
            this.dropdownView.button.collectionView.updateInput(string);
        }
    },

    __onBubbleDeleteLast(): void {
        const model = this.selectedButtonCollection.models[this.selectedButtonCollection.models.length - 2];

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
            this.open();
        } else {
            this.__sendPanelCommand('down');
        }
    },

    __sendPanelCommand(command: string, options: {}): void {
        if (this.dropdownView.isOpen) {
            this.dropdownView.panelView.handleCommand(command, options);
        }
    },

    triggerNotReady() {
        this.isReady = false;
        this.dropdownView?.buttonView?.setLoading(true);
        this.trigger('view:notReady');
        return false;
    },

    triggerReady() {
        this.isReady = true;
        this.dropdownView?.buttonView?.setLoading(false);
        this.trigger('view:ready');
        return true;
    },

    __tryPointFirstRow() {
        if (this.panelCollection.length) {
            this.panelCollection.selectSmart(this.panelCollection.at(0), false, false, false);
        } else {
            this.panelCollection.pointOff();
        }
    },

    __onDropdownOpen(): void {
        this.focus();
        this.__tryPointFirstRow();
        this.trigger('dropdown:open');
    },

    __onDropdownClose() {
        this.blur();
        this.panelCollection.pointOff();
        this.trigger('dropdown:close');
    },

    __clearSearch() {
        this.__startSearch('');
    },

    __startSearch(string) {
        this.updateButtonInput(string);
        this.debouncedFetchUpdateFilter(string);
    },

    __proxyValueSelect() {
        if (!this.isReady) {
            this.fetchUpdateFilter(this.searchText);
        } else if (this.dropdownView.isOpen) {
            this.__onValueSelect();
        }
    }
}));
