// @flow
import VirtualCollection from '../../collections/VirtualCollection';
import dropdown from 'dropdown';
import { helpers, keyCode } from 'utils';
import template from './templates/datalistEditor.hbs';
import BaseEditorView from './base/BaseEditorView';
import ButtonView from './impl/datalist/views/ButtonView';
import PanelView from './impl/datalist/views/PanelView';
import ReferenceListItemView from './impl/datalist/views/ReferenceListItemView';
import ReferenceListWithSubtextItemView from './impl/datalist/views/ReferenceListWithSubtextItemView';
import formRepository from '../formRepository';
import SelectableBehavior from '../../models/behaviors/SelectableBehavior';
import userBubble from './impl/datalist/templates/userBubble.hbs';
import documentSimpleBubble from './impl/document/templates/documentSimpleBubble';
import DocumentEditorView from './DocumentEditorView';

const defaultOptions = () => ({
    displayAttribute: 'name',
    buttonView: ButtonView,

    showAdditionalList: false,
    subtextProperty: '',
    iconProperty: '',

    listItemView: ReferenceListItemView,
    listItemViewWithText: ReferenceListWithSubtextItemView,
    showCheckboxes: false,
    textFilterDelay: 300,

    fetchFiltered: false,
    collection: null,
    showCollection: true,

    maxQuantitySelected: 1,
    maxButtonItems: Infinity,
    allowEmptyValue: true,
    canDeleteItem: true,

    valueType: 'normal',
    idProperty: 'id',
    showSearch: true,

    emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET'),

    class: undefined,
    buttonBubbleTemplate: undefined,
    panelBubbleTemplate: undefined,

    boundEditor: undefined,

    //dropdown options
    externalBlurHandler: undefined,
    minAvailableHeight: undefined,

    //controller's methods
    createValueUrl: undefined,
    edit: undefined,
    addNewItem: undefined,
    addNewItemText: Localizer.get('CORE.FORM.EDITORS.REFERENCE.CREATENEW'),

    //deprecated options
    controller: null,
    storeArray: false,

    format: undefined //name of preset for editor
});

const presetsDefaults = {
    document: options => ({
        listTitle: options.title,
        panelClass: 'datalist-panel__formatted',
        buttonBubbleTemplate: documentSimpleBubble,
        panelBubbleTemplate: documentSimpleBubble,
        valueType: 'normal',
        showCollection: false,
        idProperty: 'uniqueId',
        showSearch: false,
        addNewItem: datalistView => datalistView.boundEditor.openFileUploadWindow(),
        boundEditor: DocumentEditorView,
        addNewItemText: Localizer.get('CORE.FORM.EDITORS.DOCUMENT.ADDDOCUMENT')
    }),
    user: options => ({
        listTitle: Localizer.get('CORE.FORM.EDITORS.MEMBERSELECT.ALLUSERS'),
        title: Localizer.get('CORE.FORM.EDITORS.MEMBERSELECT.SELECTEDUSERS'),
        panelClass: 'datalist-panel__formatted',
        buttonBubbleTemplate: userBubble,
        panelBubbleTemplate: userBubble
    })
};

const stop = event => {
    event.preventDefault();
    event.stopPropagation();
};

/* Some DOCS
    Datalist fetch [searched] data from collection on click if fetchFiltered true.

    Datalist filter state store in view.searchText(trim and upperCase) and input value (raw).

    ToDo:
    1.Fix bug: valueTypeId, many: if model already has displayText, collection has no this el, on delete some, another will be #.
    2.Fix focus logic (make as dateTime).
    3.defaultOptions:displayAttribute should be text.
    4.getDisplayText should return string always. (String(returnedValue)).
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
        this.__mapDatalistOptions(options);
        this.valueTypeId = this.options.valueType === 'id';
        this.isButtonLimitMode = this.options.maxButtonItems !== Infinity;

        this.__createBoundEditor();

        this.__createPanelVirtualCollection();
        this.__createSelectedCollections();

        if (!this.options.fetchFiltered) {
            this.searchText = '';
        }
        this.debouncedFetchUpdateFilter = _.debounce(this.__fetchUpdateFilter, this.options.textFilterDelay);

        this.__getDisplayText = this.__getDisplayText.bind(this);

        const bubbleItemViewOptions = {
            getDisplayText: this.__getDisplayText,
            bubbleDelete: this.__onBubbleDelete.bind(this),
            edit: this.options.edit,
            canDeleteItem: this.options.maxQuantitySelected > 1 ? this.options.canDeleteItem : this.options.allowEmptyValue,
            createValueUrl: this.options.createValueUrl,
            enabled: this.getEnabled(),
            readonly: this.getReadonly()
        };

        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: this.options.buttonView,
            buttonViewOptions: {
                value: '',
                collection: this.isButtonLimitMode ? this.selectedButtonCollection : this.selectedCollection,
                bubbleItemViewOptions: Object.assign(
                    {
                        customTemplate: this.options.buttonBubbleTemplate
                    },
                    bubbleItemViewOptions
                ),
                selectedPanelCollection: this.isButtonLimitMode ? this.selectedPanelCollection : undefined,
                emptyPlaceholder: this.__getEmptyPlaceholder(),
                readonlyPlaceholder: this.__getReadonlyPlaceholder(),
                enabled: this.getEnabled(),
                readonly: this.getReadonly(),
                getFocusElementReadonly: readonly => readonly || !this.options.showSearch
            },
            panelView: PanelView,
            panelViewOptions: {
                class: this.options.panelClass,
                collection: this.panelCollection,
                showCollection: this.options.showCollection,
                selectedCollection: this.isButtonLimitMode ? this.selectedPanelCollection : undefined,
                addNewItem: this.options.addNewItem && this.__panelAddNewItem.bind(this),
                addNewItemText: this.options.addNewItemText,
                bubbleItemViewOptions: Object.assign(
                    {
                        customTemplate: this.options.panelBubbleTemplate
                    },
                    bubbleItemViewOptions
                ),
                showCheckboxes: this.options.showCheckboxes,
                listItemView: this.options.showAdditionalList ? this.options.listItemViewWithText : this.options.listItemView,
                getDisplayText: this.__getDisplayText,
                canAddItem: this.__canAddItem.bind(this),
                subTextOptions: {
                    subtextProperty: this.options.subtextProperty,
                    iconProperty: this.options.iconProperty
                },
                listTitle: this.options.listTitle,
                selectedTitle: this.options.title,
                textFilterDelay: this.options.textFilterDelay
            },
            autoOpen: false,
            renderAfterClose: false,
            externalBlurHandler: this.options.externalBlurHandler,
            minAvailableHeight: this.options.minAvailableHeight
        });

        this.__addButtonListeners();
    },

    __getEmptyPlaceholder(isEmpty = this.isEmptyValue()) {
        return isEmpty ? (this.options.showSearch ? this.options.emptyPlaceholder : '-') : '';
    },

    __getReadonlyPlaceholder(isEmpty = this.isEmptyValue()) {
        return isEmpty ? this.options.readonlyPlaceholder : '';
    },

    __mapDatalistOptions(options) {
        let defaults = defaultOptions();
        if (typeof options.format === 'string') {
            const presetFn = presetsDefaults[options.format];
            const preset = presetFn && presetFn(options);
            defaults = _.defaults(preset, defaults);
        }
        this.__applyOptions(options, defaults);
        if (this.options.controller) {
            const controller = this.options.controller;

            this.options.fetchFiltered = true;

            this.options.collection = controller.options.collection;

            this.options.createValueUrl = controller.createValueUrl?.bind(controller);
            this.options.edit = controller.edit?.bind(controller);
            this.options.addNewItem = controller.addNewItem?.bind(controller);
        }
        if (this.options.showCollection) {
            helpers.ensureOption(this.options, 'collection');
        }
    },

    __addButtonListeners() {
        const btn = this.dropdownView;
        this.listenTo(btn, 'focus', this.__onButtonFocus);
        this.listenTo(btn, 'click', () => this.__onButtonClick());
        this.listenTo(btn, 'input:keydown', this.__onInputKeydown);
        this.listenTo(btn, 'input:search', this.__onInputSearch);
        this.listenTo(btn, 'pointerdown', (button, e) => {
            if (e.target.tagName === 'A') {
                e.stopPropagation();
                return;
            }
            this.__onButtonClick();
        });
    },

    __createBoundEditor() {
        if (!this.options.boundEditor) {
            return;
        }
        this.boundEditor = new this.options.boundEditor({
            value: this.value
        });
        this.setValue(this.boundEditor.getValue());
        this.__bindEditorsState();
    },

    __bindEditorsState() {
        this.listenTo(this.boundEditor, 'set:loading', this.setLoading);
        this.listenTo(this.boundEditor, 'change', () => this.setValue(this.boundEditor.getValue()));
        this.listenTo(this, 'change', () => this.boundEditor.setValue(this.getValue()));
    },

    __createPanelVirtualCollection() {
        let collection = this.options.collection;
        let collectionIsBackbone = false;
        if (collection instanceof Backbone.Collection) {
            collectionIsBackbone = true;
        } else {
            collection = new Backbone.Collection(collection);
        }

        this.panelCollection = new VirtualCollection(collection, {
            isSliding: true,
            selectableBehavior: 'multi'
        });

        if (collectionIsBackbone) {
            this.listenTo(collection, 'reset update', () => {
                this.__tryPointFirstRow();
                this.__updateSelectedOnPanel();
                this.valueTypeId && this.__value(this.value, { triggerChange: false }); // add condition some values has #.
            });
        } else if (this.options.fetchFiltered) {
            console.warn('If fetchFiltered, data must be received from collection, but you passed array as collection. Therefore fetchFiltered will be change to false');
            this.options.fetchFiltered = false;
        }

        if (!this.options.fetchFiltered) {
            this.listenTo(this.panelCollection, 'filter', () => {
                this.__tryPointFirstRow();
                this.__updateSelectedOnPanel();
            });
        }

        this.listenTo(this.panelCollection, 'selected', _.debounce(this.__onValueSet, 0));
        this.listenTo(this.panelCollection, 'deselected', _.debounce(this.__onValueUnset, 0));
    },

    __createSelectedCollections() {
        const selectedCollection = (this.selectedCollection = new Backbone.Collection());
        this.selectedCollection.model = Backbone.Model.extend({
            initialize() {
                this.selectableCollection = selectedCollection;
                _.extend(this, new SelectableBehavior.Selectable(this));
            }
        });

        _.extend(this.selectedCollection, new SelectableBehavior.SingleSelect(this.selectedCollection));

        if (this.isButtonLimitMode) {
            this.selectedButtonCollection = new Backbone.Collection();
            this.selectedPanelCollection = new Backbone.Collection();
        }
    },

    __toggleSelectAddNewButton(state) {
        if (this.__isAddNewButtonSelect === state) {
            return;
        }
        this.__isAddNewButtonSelect = state;
        this.dropdownView.panelView?.toggleSelectAddNewButton(state);
    },

    regions: {
        dropdownRegion: {
            el: '.js-dropdown-region',
            replaceElement: true
        }
    },

    className() {
        const classList = [];
        const maxQuantity = this.options.maxQuantitySelected;

        if (maxQuantity === 1) {
            classList.push('editor_bubble--single');
        }
        if (this.options.edit) {
            classList.push('editor_bubble--edit');
        }
        if (this.options.canDeleteItem) {
            classList.push('editor_bubble--delete');
        }

        return `editor editor_bubble ${classList.join(' ')}`;
    },

    template: Handlebars.compile(template),

    setValue(value): void {
        this.__value(value, { triggerChange: false, isLoadIfNeeded: true });
    },

    onRender(): void {
        this.boundEditor?.render();

        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.__onDropdownClose);

        this.showChildView('dropdownRegion', this.dropdownView);
    },

    focusElement: null,

    isEmptyValue(value = this.getValue()): boolean {
        return value == null || (Array.isArray(value) && value.length === 0);
    },

    __updateEmpty() {
        const isEmpty = this.isEmptyValue();
        BaseEditorView.prototype.__updateEmpty.call(this, isEmpty);
        //because called before initialize - wtf
        if (this.dropdownView?.isRendered()) {
            this.__togglePlaceholder(isEmpty);
        }
    },

    __togglePlaceholder(isEmpty) {
        this.dropdownView.options.readonlyPlaceholder = this.__getReadonlyPlaceholder(isEmpty);
        this.dropdownView.options.emptyPlaceholder = this.__getEmptyPlaceholder(isEmpty);
        this.dropdownView.updatePlaceholder();
    },

    __convertToValue(estimatedObjects) {
        if (this.valueTypeId) {
            return Array.isArray(estimatedObjects)
                ? estimatedObjects.map(value => value && value[this.options.idProperty])
                : estimatedObjects && estimatedObjects[this.options.idProperty];
        }
        return estimatedObjects;
    },

    __convertToObject(value) {
        this.__adjustValue(value);
    },

    setPermissions(enabled, readonly) {
        BaseEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.dropdownView.setPermissions(enabled, readonly);
        this.dropdownView.collectionView.updateEnabled(this.getEditable());
    },

    focus(): void {
        this.__focusButton();
        this.onFocus();
    },

    blur(): void {
        this.__setInputValue('');
        this.__blurButton();
        this.panelCollection.pointOff();
        this.__getSelectedBubble()?.deselect();
        this.__toggleSelectAddNewButton(false);
        this.onBlur(undefined, {
            triggerChange: false
        });
    },

    isButtonFocus() {
        const inputView = this.dropdownView;
        return inputView && inputView.ui.input[0] === document.activeElement;
    },

    isThisFocus() {
        return this.el.contains(document.activeElement);
    },

    __clearSearch() {
        this.__startSearch('', { open: false });
    },

    __startSearch(string, options) {
        this.__setInputValue(string);
        this.__fetchUpdateFilter(string, options);
    },

    __getInputValue() {
        return this.dropdownView ? this.dropdownView.getInputValue() : '';
    },

    __setInputValue(string) {
        this.dropdownView.setInputValue(string);
    },

    __onInputSearch(button, e): void {
        if (this.options.fetchFiltered) {
            this.triggerNotReady();
        }
        this.debouncedFetchUpdateFilter(this.__getInputValue());
    },

    __fetchUpdateFilter(text, { forceCompareText = this.options.fetchFiltered && !this.isLastFetchSuccess, openOnRender = false, open = true } = {}) {
        const searchText = (text || '').toUpperCase().trim();
        if (this.searchText === searchText && !forceCompareText) {
            this.__updateSelectedOnPanel();
            open && this.open(openOnRender);
            if (this.options.fetchFiltered) {
                this.triggerReady();
            }
            return;
        }
        this.searchText = searchText;
        this.__setInputValue(text);

        if (this.options.fetchFiltered) {
            return this.__fetchDataAndOpen(this.searchText, { openOnRender, open });
        }

        this.__filterPanelCollection(this.searchText);
        open && this.open(openOnRender);
    },

    async __fetchDataAndOpen(fetchedDataForSearchText, { openOnRender, open }) {
        this.triggerNotReady();
        this.panelCollection.pointOff();
        try {
            const collection = this.options.collection;
            await collection.fetch({ data: { filter: fetchedDataForSearchText } });

            if (this.searchText !== fetchedDataForSearchText) {
                throw new Error('searched was updated');
            }

            this.__tryPointFirstRow();
            this.__updateSelectedOnPanel();

            this.isLastFetchSuccess = true;
            open && this.open(openOnRender);
            this.triggerReady(); //don't move to finally, recursively.
        } catch (e) {
            this.isLastFetchSuccess = false;
            this.triggerReady();
        }
    },

    __filterPanelCollection(searchText) {
        const filter = attributes => {
            const displayText = this.__getDisplayText(attributes);
            if (!displayText) {
                return false;
            }
            return String(displayText)
                .toUpperCase()
                .includes(searchText);
        };

        this.panelCollection.filter(filter);
    },

    __resetSelectedCollection(models) {
        if (!this.selectedCollection) {
            return;
        }

        // this.selectedCollection.reset(models == null ? undefined : models);
        // select selected after reset

        const selectedIds = Object.values(this.selectedCollection.selected).map(selectedModel => selectedModel.get(this.options.idProperty));

        const arrayOfAttributes = models == null ? [] : this.__toJSON(models);

        this.selectedCollection.set(arrayOfAttributes, {
            add: true,
            remove: true, // remove others (like reset)

            // current models can has no display text for valueType = 'id
            merge: this.valueTypeId // add condition: some models has "#"
        });

        selectedIds.forEach(selectedId => this.selectedCollection.get(selectedId)?.select());

        if (this.isButtonLimitMode) {
            const selectedButtonModels = this.selectedCollection.models.slice(0, this.options.maxButtonItems);
            const selectedPanelModels = this.selectedCollection.models.slice(this.options.maxButtonItems);

            this.selectedButtonCollection.set(selectedButtonModels, { add: true, remove: true });
            this.selectedPanelCollection.set(selectedPanelModels, { add: true, remove: true });
            this.dropdownView.setCounter(this.selectedPanelCollection.length);
        }

        this.dropdownView.trigger('change:content');
    },

    __toJSON(models) {
        return Array.isArray(models) ? models.map(model => this.__getAttributes(model)) : this.__getAttributes(models);
    },

    __getAttributes(model) {
        return model instanceof Backbone.Model ? model.toJSON() : model;
    },

    __updateSelectedOnPanel() {
        this.panelCollection.selected = {};

        if (this.options.maxQuantitySelected === 1) {
            return;
        }

        if (this.panelCollection.length > 0 && this.value) {
            this.value.forEach(editorValue => {
                const id = editorValue && editorValue[this.options.idProperty] !== undefined ? editorValue[this.options.idProperty] : editorValue;

                this.panelCollection.get(id)?.select({ isSilent: true });
            });
        }
    },

    onAttach() {
        if (this.options.openOnRender) {
            this.__onButtonClick(undefined, {
                forceCompareText: false,
                openOnRender: true
            });
        }
    },

    adjustPosition(isNeedToRefreshAnchorPosition) {
        if (this.dropdownView) {
            this.dropdownView.adjustPosition(isNeedToRefreshAnchorPosition);
        }
    },

    getIsOpenAllowed(openOnRender) {
        const skipFocusCheck = openOnRender;
        return skipFocusCheck ? this.getEditable() && !this.dropdownView.isOpen : this.getEditable() && !this.dropdownView.isOpen && this.isThisFocus();
    },

    open(openOnRender) {
        if (this.getIsOpenAllowed(openOnRender)) {
            if (this.options.fetchFiltered && this.isLastFetchSuccess === undefined) {
                this.__fetchUpdateFilter('');
            } else {
                this.dropdownView.open();
                this.__focusButton();
                this.__tryPointFirstRow();
            }
        }
    },

    close() {
        this.dropdownView.close();
        this.__focusButton();
    },

    __adjustValue(value: any, isLoadIfNeeded = false) {
        if (this.isEmptyValue(value)) {
            return this.options.maxQuantitySelected === 1 ? null : [];
        }
        const result = this.valueTypeId ? this.__adjustValueForIdMode(value, isLoadIfNeeded) : value;
        return result;
    },

    __adjustValueForIdMode(value, isLoadIfNeeded) {
        if (this.options.fetchFiltered && isLoadIfNeeded && !this.isLastFetchSuccess && this.options.collection.length === 0) {
            this.listenToOnce(this, 'view:ready', () => {
                const adjustedValue = this.__adjustValueFromLoaded(value);
                this.setValue(Array.isArray(adjustedValue) ? adjustedValue.map(item => item.toJSON()) : adjustedValue);
            });
            this.__fetchUpdateFilter('', { forceCompareText: true });
        }
        return this.__adjustValueFromLoaded(value);
    },

    __adjustValueFromLoaded(value) {
        if (Array.isArray(value)) {
            return value.map(v => this.__getValueFromCollection(v));
        }
        return this.__getValueFromCollection(value);
    },

    __getValueFromCollection(primitive) {
        // not use get, because 1. get(null) => undefined; 2. this.options.collection may be array or collection.
        return (
            this.options.collection.find(
                model =>
                    (model instanceof Backbone.Model
                        ? model.get(this.options.idProperty)
                        : // eslint-disable-next-line eqeqeq
                          model[this.options.idProperty]) == primitive
            ) || this.__tryToCreateAdjustedValue(primitive)
        );
    },

    __tryToCreateAdjustedValue(primitive) {
        return {
            [this.options.idProperty]: primitive,
            text: this.__isValueEqualNotSet(primitive) ? Localizer.get('CORE.COMMON.NOTSET') : undefined
        };
    },

    __isValueEqualNotSet(value) {
        return value == null || value === 'Undefined';
    },

    isValueIncluded(value) {
        if (this.valueTypeId) {
            if (_.isObject(value)) {
                return this.value.some(v => v === value[this.options.idProperty]);
            }
            return this.value.includes(value);
        }
        return this.value.some(v => v[this.options.idProperty] === (_.isObject(value) ? value[this.options.idProperty] : value));
    },

    __value(value, { triggerChange = false, isLoadIfNeeded = false } = {}) {
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
                this.__value(value, { triggerChange: true });
                this.panelCollection.selectNone({ isSilent: true });
                this.close();
                this.__setInputValue('');
                return;
            }

            this.__value(this.value.concat(value), { triggerChange: true });
        } else {
            model.deselect({ isSilent: true });
        }

        const canAddItem = this.__canAddItem();
        canAddItem === false && this.dropdownView.panelView?.toggleSelectable(false);

        if (!canAddItem) {
            this.close();
            this.__setInputValue('');
        } else {
            this.__focusButton();
            this.__clearSearch();
        }
    },

    __onValueUnset(model: Backbone.Model, options = {}): void {
        if (options.isSilent) {
            return;
        }
        this.__onBubbleDelete(model);
    },

    __canAddItem(): boolean {
        const isAccess = this.getEditable();
        const maxQuantity = this.options.maxQuantitySelected;

        if (maxQuantity === 1) {
            return true;
        }

        return isAccess && maxQuantity > this.selectedCollection.length;
    },

    __getDisplayText(value, displayAttribute = this.options.displayAttribute): string {
        if (value == null) {
            return '';
        }

        const attributes = this.__getAttributes(value);
        if (typeof displayAttribute === 'function') {
            return displayAttribute(attributes, this.model);
        }
        return attributes[displayAttribute] || attributes.text || `#${attributes[this.options.idProperty]}`;
    },

    __onButtonFocus(view, event) {
        if (this.isNextFocusInner) {
            event.stopImmediatePropagation();
            this.isNextFocusInner = false;
            return;
        }
        this.__onInputSearch();
    },

    __focusButton(): void {
        if (this.isButtonFocus()) {
            return;
        }
        this.isNextFocusInner = true;
        this.dropdownView.focus();
    },

    __blurButton(): void {
        this.dropdownView.blur();
    },

    __onButtonClick(event, { forceCompareText = this.options.fetchFiltered, openOnRender = false } = {}): void {
        if (!this.getEditable()) {
            return;
        }
        this.__focusButton();
        const filterValue = this.dropdownView.value;
        this.__fetchUpdateFilter(filterValue, { forceCompareText, openOnRender });
    },

    __onBubbleDelete(model: Backbone.Model): Backbone.Model {
        if (!model || !this.getEditable()) {
            return;
        }

        if (!(this.selectedCollection.length === 1 && !this.options.allowEmptyValue)) {
            const deletedValue = model.get(this.options.idProperty);
            model.deselect({ isSilent: true });
            this.panelCollection.get(deletedValue)?.deselect({ isSilent: true });

            const selected = [].concat(this.getValue() || []);

            const removingModelIndex = selected.findIndex(s => (s && s[this.options.idProperty] !== undefined ? s[this.options.idProperty] : s) === deletedValue);

            if (removingModelIndex !== -1) {
                selected.splice(removingModelIndex, 1);
            }

            this.__value(selected, { triggerChange: true });

            this.dropdownView.panelView?.toggleSelectable(true);
        }

        this.__focusButton();

        if (!this.dropdownView.isOpen) {
            this.__onButtonClick();
        }
    },

    __onBubbleDeleteLast(): void {
        const model = this.selectedCollection.models[this.selectedCollection.models.length - 1];

        this.__onBubbleDelete(model);
    },

    __onInputKeydown(button, e) {
        // Datalist has 4 control modes: input, bubbles, panel, addNewItem.
        // In all of these some quan (bubble of item) is selected
        // Quantity control modes === bubble or item or addNewItem control modes.
        if (!this.getEditable()) {
            stop(e);
            return;
        }
        if (e.keyCode === keyCode.F2) {
            stop(e);
            this.__toggleDropdown();
            return;
        }
        if (!this.__getIsQuantityControl(e)) {
            return;
        }
        this.__isQuantityControl = true;
        if (!this.dropdownView.isOpen) {
            this.open();
            return;
        }
        const selectedBubble = this.__getSelectedBubble();
        if (selectedBubble) {
            this.__bubblesKeydown(e, selectedBubble);
        } else if (this.panelCollection.lastPointedModel) {
            this.__panelKeydown(e);
        } else if (this.options.addNewItem) {
            this.__addNewItemKeydown(e);
        } else {
            this.__tryPointFirstRow();
            this.__isQuantityControl = false;
        }
    },

    __toggleDropdown() {
        if (this.dropdownView.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    __bubblesKeydown(e, selectedBubble) {
        if (this.__checkExitFromBubblesControl(e, selectedBubble)) {
            stop(e);
            selectedBubble.deselect();
            if (this.panelCollection.length) {
                this.__tryPointFirstRow();
                return;
            }
            if (this.options.addNewItem) {
                this.__addNewItemKeydown(e);
            } else {
                this.__tryPointFirstRow();
            }
        }
        switch (e.keyCode) {
            case keyCode.DOWN:
            case keyCode.RIGHT:
                stop(e);
                this.__selectBubbleBy(1, selectedBubble);
                break;
            case keyCode.UP:
            case keyCode.LEFT:
                stop(e);
                this.__selectBubbleBy(-1, selectedBubble);
                break;
            case keyCode.DELETE:
                stop(e);
                this.__selectBubbleBy(1, selectedBubble);
                this.__onBubbleDelete(selectedBubble);
                break;
            case keyCode.BACKSPACE:
                stop(e);
                this.__selectBubbleBy(-1, selectedBubble);
                this.__onBubbleDelete(selectedBubble);
                break;
            default:
                this.__isQuantityControl = false;
                break;
        }
    },

    __panelKeydown(e) {
        if (this.__checkExitFromPanelControlToBubble(e)) {
            stop(e);
            this.panelCollection.pointOff();
            this.__selectBubbleLast();
            return;
        } else if (this.__checkExitFromPanelControlToAddNewItem(e)) {
            stop(e);
            this.panelCollection.pointOff();
            this.__toggleSelectAddNewButton(true);
            return;
        }
        switch (e.keyCode) {
            case keyCode.DOWN:
            case keyCode.RIGHT:
                stop(e);
                this.moveCursorBy(1);
                break;
            case keyCode.UP:
            case keyCode.LEFT:
                stop(e);
                this.moveCursorBy(-1);
                break;
            case keyCode.ENTER:
            case keyCode.SPACE:
                stop(e);
                this.__onValueSelect();
                break;
            default:
                this.__isQuantityControl = false;
                break;
        }
    },

    __addNewItemKeydown(e) {
        switch (e.keyCode) {
            case keyCode.DOWN:
            case keyCode.RIGHT:
                stop(e);
                this.__toggleSelectAddNewButton(true);
                break;
            case keyCode.UP:
            case keyCode.LEFT:
                stop(e);
                this.__toggleSelectAddNewButton(false);
                this.__tryPointLastRow();
                break;
            case keyCode.ENTER:
            case keyCode.SPACE:
                stop(e);
                this.__panelAddNewItem();
                break;
            default:
                this.__isQuantityControl = false;
                break;
        }
    },

    __panelAddNewItem() {
        if (!this.options.addNewItem) {
            return;
        }
        this.close();
        this.options.addNewItem(this);
    },

    __checkExitToInputControl(e, selectedBubble = this.__getSelectedBubble()) {
        return this.__isBubbleLast(selectedBubble) && (keyCode.RIGHT === e.keyCode || (keyCode.DOWN === e.keyCode && this.panelCollection.length === 0));
    },

    __checkExitFromBubblesControl(e, selectedBubble = this.__getSelectedBubble()) {
        return this.__isBubbleLast(selectedBubble) && [keyCode.RIGHT, keyCode.DOWN].includes(e.keyCode);
    },

    __isBubbleLast(selectedBubble) {
        return selectedBubble && this.selectedCollection.indexOf(selectedBubble) === this.selectedCollection.length - 1;
    },

    __getIsQuantityControl(e) {
        return (
            this.__isQuantityControl ||
            [keyCode.UP, keyCode.DOWN, keyCode.ENTER, keyCode.SPACE].includes(e.keyCode) || // || this.__checkEntryToPanel(e);
            this.__checkEntryToBubbles(e)
        );
    },

    __checkEntryToBubbles(e) {
        const input = e.target;
        return input.selectionEnd === 0 && e.keyCode === keyCode.LEFT;
    },

    __checkEntryToPanel(e) {
        const input = e.target;
        return input.selectionEnd === 0 && ![keyCode.UP, keyCode.DOWN].includes(e.keyCode);
    },

    __checkExitFromPanelControlToBubble(e) {
        const __isFirstPanelRowSelected = () => this.panelCollection.indexOf(this.panelCollection.lastPointedModel) === 0;
        return this.selectedCollection.length && (!this.panelCollection.length || (__isFirstPanelRowSelected() && [keyCode.LEFT, keyCode.UP].includes(e.keyCode)));
    },

    __checkExitFromPanelControlToAddNewItem(e) {
        const __isLastPanelRowSelected = () => this.panelCollection.indexOf(this.panelCollection.lastPointedModel) === this.panelCollection.length - 1;
        return this.options.addNewItem && __isLastPanelRowSelected() && [keyCode.DOWN, keyCode.RIGHT].includes(e.keyCode);
    },

    __getSelectedBubble() {
        return this.selectedCollection.getSelected();
    },

    __selectBubbleBy(delta, selectedBubble = this.__getSelectedBubble()) {
        if (!selectedBubble || !this.selectedCollection.length) {
            return;
        }
        const selectedIndex = this.selectedCollection.indexOf(selectedBubble);
        const newSelectedIndex = this.__checkMinMaxBubble(selectedIndex + delta);
        if (newSelectedIndex === selectedIndex) {
            return;
        }
        this.selectedCollection.at(newSelectedIndex).select();
    },

    __checkMinMaxBubble(bubbleIndex) {
        const minIndex = 0;
        const maxIndex = this.selectedCollection.length - 1;

        return Math.max(Math.min(bubbleIndex, maxIndex), minIndex);
    },

    __selectBubbleLast() {
        if (!this.selectedCollection.length) {
            return;
        }
        this.selectedCollection.select(this.selectedCollection.at(this.selectedCollection.length - 1));
    },

    moveCursorBy(delta) {
        if (!this.dropdownView.isOpen) {
            return;
        }
        
        this.panelCollection.trigger('moveCursorBy', delta, { isLoop: false, shiftPressed: false  });
    },

    //start fetch
    triggerNotReady() {
        this.isReady = false;
        this.setLoading(true);
        this.trigger('view:notReady');
        return false;
    },

    //fetch complete
    triggerReady() {
        this.isReady = true;
        this.setLoading(false);
        this.trigger('view:ready');
        return true;
    },

    setLoading(state) {
        this.dropdownView.setLoading(state);
    },

    __tryPointFirstRow() {
        if (this.panelCollection.length) {
            this.__getSelectedBubble()?.deselect();
            this.panelCollection.selectSmart(this.panelCollection.at(0), false, false, false);
        } else {
            this.panelCollection.pointOff();
        }
    },

    __tryPointLastRow() {
        if (this.panelCollection.length) {
            this.__getSelectedBubble()?.deselect();
            this.panelCollection.selectSmart(this.panelCollection.at(this.panelCollection.length - 1), false, false, false);
        } else {
            this.panelCollection.pointOff();
            this.__selectBubbleLast();
        }
    },

    __onDropdownOpen(): void {
        this.focus();
        this.trigger('dropdown:open');
    },

    __onDropdownClose() {
        this.blur();
        this.trigger('dropdown:close');
    }
}));
