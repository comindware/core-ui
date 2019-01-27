// @flow
import VirtualCollection from '../../collections/VirtualCollection';
import dropdown from 'dropdown';
import { helpers, keyCode } from 'utils';
import template from './templates/datalistEditor.hbs';
import BaseEditorView from './base/BaseEditorView';
import FakeInputModel from './impl/datalist/models/FakeInputModel';
import ButtonView from './impl/datalist/views/ButtonView';
import PanelView from './impl/datalist/views/PanelView';
import ReferenceListWithSubtextItemView from './impl/datalist/views/ReferenceListWithSubtextItemView';
import formRepository from '../formRepository';
import DefaultReferenceModel from './impl/datalist/models/DefaultReferenceModel';
import StaticController from './impl/datalist/controllers/StaticController';
import SelectableBehavior from '../../models/behaviors/SelectableBehavior';

type DataValue = {
    id: string,
    name?: string,
    text?: string
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
    showAdditionalList: false,
    subtextProperty: '',
    iconProperty: '',
    listItemViewWithText: ReferenceListWithSubtextItemView,
    showCheckboxes: false,
    textFilterDelay: 300,
    collection: null,
    maxQuantitySelected: 1,
    storeArray: false,
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
    Datalist fetch [searched] data from controller on click
    Comparator selected collection should be change place for fakeInputModel.

    ToDo:
    1.staticController has no addNewItem function.
    2.defaultOptions:displayAttribute should be text.
    3.getDisplayText should has defaults displayAttribute = this.options.displayAttribute.
    4.getDisolayText should return string always. (String(returnedValue)).
    5.if showCheckboxes and maxQuantitySelected === 1, checkbox not checked.
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
 * @param {Boolean} [options.storeArray=false] DEPRECATED. Store array in model whatever maxQuantitySelected one or many.
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

        this.__createSelectedButtonCollection();

        this.__value(this.value, false, true);
        this.debouncedFetchUpdateFilter = _.debounce(this.fetchUpdateFilter, this.options.textFilterDelay);
        this.listenTo(this.panelCollection, 'selected', this.__onValueSet);
        this.listenTo(this.panelCollection, 'deselected', this.__onValueUnset);

        const reqres = Backbone.Radio.channel(_.uniqueId('datalistE'));

        this.reqres = reqres;

        reqres.reply({
            'bubble:delete': this.__onBubbleDelete.bind(this),
            'input:keydown': this.__onInputKeydown.bind(this),
            'input:search': this.__onInputSearch.bind(this),
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
                showSearch: this.options.showSearch,
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
                canSelect: () => this.__canAddItem(),
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

    __createSelectedButtonCollection() {
        this.selectedButtonCollection = new (Backbone.Collection.extend({
            comparator: (a, b) => {
                if (a instanceof FakeInputModel) {
                    return 1;
                }
                if (b instanceof FakeInputModel) {
                    return -1;
                }
                return 0;
            },

            model: Backbone.Model.extend({
                initialize() {
                    _.extend(this, new SelectableBehavior.Selectable(this));
                }
            })
        }))();

        _.extend(this.selectedButtonCollection, new SelectableBehavior.SingleSelect(this.selectedButtonCollection));

        this.__addFakeInputModel(this.selectedButtonCollection);
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
        this.__value(value, false);
    },

    onRender(): void {
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.__onDropdownClose);

        this.showChildView('dropdownRegion', this.dropdownView);
    },

    isEmptyValue(): boolean {
        const value = this.getValue();
        return Array.isArray(value) ? value == null || !value.length : value == null;
    },

    __convertToValue(estimatedObjects) {
        if (this.getOption('valueType') === 'id') {
            return Array.isArray(estimatedObjects) ? estimatedObjects.map(value => value && value.id) : estimatedObjects && estimatedObjects.id;
        }
        return estimatedObjects;
    },

    __convertToObject(value) {
        this.__adjustValue(value);
    },

    setReadonly(readonly: Boolean): void {
        BaseEditorView.prototype.setReadonly.call(this, readonly);
        if (!this.isRendered()) {
            return;
        }
        const isEnabled = this.__getEditorEnabled();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.collectionView.updateEnabled(isEnabled);
        this.getInputView()?.setReadonly(readonly);
    },

    setEnabled(enabled: Boolean): void {
        BaseEditorView.prototype.setEnabled.call(this, enabled);
        if (!this.isRendered()) {
            return;
        }
        const isEnabled = this.__getEditorEnabled();
        this.dropdownView.options.buttonViewOptions.enabled = isEnabled;
        this.dropdownView.button.collectionView.updateEnabled(isEnabled);
        this.getInputView()?.setEnabled(enabled);
    },

    focus(): void {
        this.__focusButton();
        this.onFocus();
    },

    blur(): void {
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

        // this.selectedButtonCollection.reset(models == null ? undefined : models);
        // select selected after reset

        this.selectedButtonCollection.remove(
            this.selectedButtonCollection.filter(model => !(model instanceof FakeInputModel) && !(Array.isArray(models) && models.some(newModel => newModel.id === model.id)))
        );
        if (models) {
            this.selectedButtonCollection.add(models, { merge: true });
        }
        this.__updateFakeInputModel();
    },

    __resetPanelVirtualCollection(rawDataVirtual) {
        this.panelCollection.totalCount = rawDataVirtual.totalCount;
        this.panelCollection.reset(rawDataVirtual.collection);
        this.panelCollection.selected = {};

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
        return this.__getEditorEnabled() && !this.dropdownView.isOpen && this.isThisFocus();
    },

    __getEditorEnabled() {
        return this.getEnabled() && !this.getReadonly();
    },

    open(openOnRender) {
        if (openOnRender || this.getIsOpenAllowed()) {
            this.dropdownView.open();
            this.__focusButton();
        }
    },

    close() {
        this.dropdownView.close();
        this.__focusButton();
    },

    __adjustValue(value: any, isLoadIfNeeded = false) {
        if (value == null || (Array.isArray(value) && value.length === 0)) {
            return this.options.maxQuantitySelected === 1 ? null : [];
        }
        const result = this.getOption('valueType') === 'id' ? this.__adjustValueForIdMode(value, isLoadIfNeeded) : value;
        return result;
    },

    __adjustValueForIdMode(value, isLoadIfNeeded) {
        if (isLoadIfNeeded && !this.isLastFetchSuccess && this.panelCollection.length === 0) {
            this.listenToOnce(this, 'view:ready', () => {
                const adjustedValue = this.__adjustValueFromLoaded(value);
                this.setValue(Array.isArray(adjustedValue) ? adjustedValue.map(item => item.toJSON()) : adjustedValue);
            });
            this.fetchUpdateFilter('', true);
        }
        return this.__adjustValueFromLoaded(value);
    },

    __adjustValueFromLoaded(value) {
        if (Array.isArray(value)) {
            return value.map(v => this.__getValueFromPanelCollection(v));
        }
        return this.__getValueFromPanelCollection(value);
    },

    __getValueFromPanelCollection(value) {
        return (
            this.panelCollection.get(value)?.toJSON() ||
            (_.isObject(value) && this.panelCollection.findWhere(value)?.toJSON()) || //backbone get no item with id == null
            this.__tryToCreateAdjustedValue(value)
        );
    },

    __tryToCreateAdjustedValue(value) {
        return _.isObject(value)
            ? value
            : {
                  id: value,
                  text: this.__isValueEqualNotSet(value) ? Localizer.get('CORE.COMMON.NOTSET') : undefined
              };
    },

    __isValueEqualNotSet(value) {
        return value == null || value === 'Undefined';
    },

    isValueIncluded(value) {
        if (this.options.valueType === 'id') {
            if (_.isObject(value)) {
                return this.value.some(v => v === value.id);
            }
            return this.value.includes(value);
        }
        return this.value.some(v => v.id === (_.isObject(value) ? value.id : value));
    },

    __value(value, triggerChange, isLoadIfNeeded = false) {
        const adjustedValue = this.__adjustValue(value, isLoadIfNeeded);

        this.value = this.__convertToValue(adjustedValue);

        if (this.options.storeArray && !Array.isArray(this.value)) {
            this.value = this.value == null ? this.value : [this.value];
        }

        this.__resetSelectedCollection(adjustedValue);

        if (triggerChange) {
            this.__triggerChange();
        }

        return true;
    },

    resetCollection(collection) {
        this.__resetPanelVirtualCollection({
            collection: collection.models,
            totalCount: collection.length
        });
        this.__value(this.value);
    },

    __onValueSelect(): void {
        if (this.panelCollection.lastPointedModel) {
            this.panelCollection.lastPointedModel.toggleSelected();
        }
    },

    __onValueSet(model: Backbone.Model, options = {}): void {
        if (options.isSilent) {
            return;
        }
        if (this.__canAddItem()) {
            const valueObject = model ? model.toJSON() : null;
            const value = this.__convertToValue(valueObject);

            if (this.options.maxQuantitySelected === 1) {
                this.__value(value, true);
                this.__checkSelectedState(model);
                this.close();
                this.updateButtonInput('');
                return;
            }

            this.__value(this.value.concat(value), true);
        }

        if (!this.__canAddItem()) {
            this.close();
            this.updateButtonInput('');
        } else {
            this.__focusButton();
            this.__clearSearch();
        }
    },

    __checkSelectedState(model) {
        const selected = Object.values(model.collection.selected);
        if (selected.length > 1) {
            selected.forEach(selectedModel => (selectedModel.selected = false));
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
        const isAccess = this.__getEditorEnabled();
        const maxQuantity = this.options.maxQuantitySelected;

        if (maxQuantity === 1) {
            return true;
        }

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
        this.close();
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
            return displayAttribute(value, this.model);
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
        if (!this.__getEditorEnabled()) {
            return;
        }
        this.fetchUpdateFilter(filterValue, forceCompareText, openOnRender);
        if (!this.showSearch) {
            this.__focusButton();
        }
    },

    __onBubbleDelete(model: Backbone.Model): Backbone.Model {
        if (!model) {
            return;
        }

        if (this.selectedButtonCollection.length === 2 && !this.options.allowEmptyValue) {
            //length = 1 + fakeInputModel
            return;
        }

        this.panelCollection.get(model.id) && this.panelCollection.get(model.id).deselect();

        const selected = [].concat(this.getValue() || []);
        const removingModelIndex = selected.findIndex(s => (s && s.id !== undefined ? s.id : s) === model.get('id'));
        if (removingModelIndex !== -1) {
            selected.splice(removingModelIndex, 1);
        }

        this.__value(selected, true);

        if (!this.dropdownView.isOpen) {
            this.__onButtonClick();
            this.__focusButton();
        } else if (!this.isButtonFocus()) {
            this.__focusButton();
        }
    },

    __updateFakeInputModel(): void {
        this.fakeInputModel && this.fakeInputModel.updateEmpty();
    },

    __addFakeInputModel(collection) {
        if (!collection) {
            return;
        }
        this.fakeInputModel = this.fakeInputModel || new FakeInputModel();
        collection.add(this.fakeInputModel);

        this.__updateFakeInputModel();
    },

    updateButtonInput(string): void {
        this.fakeInputModel?.set('searchText', string);
    },

    __onBubbleDeleteLast(): void {
        const model = this.selectedButtonCollection.models[this.selectedButtonCollection.models.length - 2];

        this.__onBubbleDelete(model);
    },

    __onInputKeydown(e) {
        const input = e.target;
        let selectedBubble;
        let selectedBubbleIndex;
        switch (e.keyCode) {
            case keyCode.UP:
                e.preventDefault();
                selectedBubble = this.__getSelectedBubble();
                selectedBubble && selectedBubble.deselect();
                this.__onInputUp();
                break;
            case keyCode.DOWN:
                e.preventDefault();
                selectedBubble = this.__getSelectedBubble();
                selectedBubble && selectedBubble.deselect();
                this.__onInputDown();
                break;
            case keyCode.RIGHT:
                selectedBubble = this.__getSelectedBubble();
                selectedBubbleIndex = this.selectedButtonCollection.indexOf(selectedBubble);
                if (selectedBubbleIndex === this.selectedButtonCollection.length - 2) {
                    selectedBubble.deselect();
                    this.open();
                    break;
                }
                this.__selectBubbleBy(1, selectedBubble);
                break;
            case keyCode.LEFT:
                selectedBubble = this.__getSelectedBubble();
                if (selectedBubble) {
                    this.__selectBubbleBy(-1, selectedBubble);
                } else if (input.selectionEnd === 0) {
                    this.close();
                    this.__selectBubbleLast();
                    this.updateButtonInput('');
                }
                break;
            case keyCode.DELETE:
                selectedBubble = this.__getSelectedBubble();
                if (selectedBubble) {
                    this.__selectBubbleBy(1, selectedBubble);
                    this.__onBubbleDelete(selectedBubble);
                }
                break;
            case keyCode.BACKSPACE:
                selectedBubble = this.__getSelectedBubble();
                if (selectedBubble) {
                    this.__selectBubbleBy(-1, selectedBubble);
                    this.__onBubbleDelete(selectedBubble);
                } else if (!input.value.trim()) {
                    this.close();
                    this.__selectBubbleLast();
                    this.updateButtonInput('');
                }
                break;
            default:
                break;
        }
    },

    __getSelectedBubble() {
        return Object.values(this.selectedButtonCollection.selected)[0];
    },

    __selectBubbleBy(delta, selectedBubble = this.__getSelectedBubble()) {
        if (!selectedBubble) {
            return;
        }
        const selectedIndex = this.selectedButtonCollection.indexOf(selectedBubble);
        const newSelectedIndex = this.__checkMinMaxBubble(selectedIndex + delta);
        if (newSelectedIndex === selectedIndex) {
            return;
        }
        this.selectedButtonCollection.at(newSelectedIndex).select();
    },

    __checkMinMaxBubble(bubbleIndex) {
        const minIndex = 0;
        const maxIndex = this.selectedButtonCollection.length - 2; //fakeInputModel is last.

        return Math.max(Math.min(bubbleIndex, maxIndex), minIndex);
    },

    __selectBubbleLast() {
        if (this.selectedButtonCollection.length < 2) {
            //only fake, has no bubbles.
            return;
        }
        this.selectedButtonCollection.select(this.selectedButtonCollection.at(this.selectedButtonCollection.length - 2));
    },

    __onInputUp(): void {
        const collection = this.panelCollection;

        if (collection.indexOf(this.panelCollection.lastPointedModel) === 0) {
            this.close();
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
