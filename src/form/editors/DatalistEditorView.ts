import VirtualCollection from '../../collections/VirtualCollection';
import dropdown from 'dropdown';
import LocalizationService from '../../services/LocalizationService';
import { helpers, keyCode } from '../../utils';
import template from './templates/datalistEditor.hbs';
import BaseEditorView from './base/BaseEditorView';
import ButtonView from './impl/datalist/views/ButtonView';
import PanelView from './impl/datalist/views/PanelView';
import ReferenceListItemView from './impl/datalist/views/ReferenceListItemView';
import ReferenceListWithSubtextItemView from './impl/datalist/views/ReferenceListWithSubtextItemView';
import formRepository from '../formRepository';
import SelectableBehavior from '../../models/behaviors/SelectableBehavior';
import DocumentEditorView from './DocumentEditorView';
import compositeReferenceCell from '../../list/templates/compositeReferenceCell.html';
import compositeDocumentCell from '../../list/templates/compositeDocumentCell.html';
import compositeUserCell from '../../list/templates/compositeUserCell.html';
import Backbone from 'backbone';
import _ from 'underscore';

type optionsType = {
    collection?: Backbone.Collection | Array<Object>,

    fetchFiltered?: boolean,
    showCollection?: boolean,

    displayAttribute?: string,
    buttonView?: Object,

    showAdditionalList?: boolean,
    subtextProperty?: string,
    iconProperty?: string,
    metaIcons?: Object,

    listItemView?: Marionette.View<Backbone.Model>,
    listItemViewWithText?: Marionette.View<Backbone.Model>,
    showCheckboxes?: boolean,
    textFilterDelay?: number,

    selectedTitle?: string,
    showSelectedTitle?: boolean,

    maxQuantitySelected?: number,
    isButtonLimitMode?: boolean,
    maxButtonItems?: number,
    allowEmptyValue?: boolean,
    canDeleteItem?: boolean,

    valueType?: 'normal' | 'id',
    idProperty?: string,
    showSearch?: boolean,

    emptyPlaceholder?: string,

    class?: string,
    buttonBubbleTemplate?: Function,
    panelBubbleTemplate?: Function,

    format?: 'user' | 'document', //name of preset for editor

    boundEditor?: Marionette.View<Backbone.Model>,
    boundEditorOptions?: Object,

    //dropdown options
    externalBlurHandler?: any,
    minAvailableHeight?: any,

    //controller's methods
    createValueUrl?: Function,
    edit?: Function,
    addNewItem?: Function,
    showAddNewButton?: boolean,
    addNewButtonText?: string,

    //deprecated options
    controller?: Marionette.Object,
    storeArray?: boolean
};

const compiledCompositeReferenceCell = Handlebars.compile(compositeReferenceCell);
const compiledCompositeDocumentCell = Handlebars.compile(compositeDocumentCell);
const compiledCompositeUserCell = Handlebars.compile(compositeUserCell);

const defaultOptions = (options: optionsType): optionsType => ({
    displayAttribute: 'name',
    buttonView: ButtonView,

    showAdditionalList: false,
    subtextProperty: '',
    iconProperty: '',
    metaIcons: Core.meta.contextIconType,

    listItemView: ReferenceListItemView,
    listItemViewWithText: ReferenceListWithSubtextItemView,
    showCheckboxes: false,
    textFilterDelay: 300,

    fetchFiltered: false,
    collection: [],
    showCollection: true,
    selectedTitle: options.title,
    showSelectedTitle: false,

    isButtonLimitMode: Boolean(options.maxButtonItems) && options.maxButtonItems !== Infinity,
    maxQuantitySelected: 1,
    maxButtonItems: Infinity,
    allowEmptyValue: true,
    canDeleteItem: true,

    valueType: 'normal',
    idProperty: 'id',
    showSearch: true,

    emptyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET'),

    class: undefined,
    buttonBubbleTemplate: compiledCompositeReferenceCell,
    panelBubbleTemplate: compiledCompositeReferenceCell,

    boundEditor: undefined,
    boundEditorOptions: {},

    //dropdown options
    externalBlurHandler: undefined,
    minAvailableHeight: undefined,

    //controller's methods
    createValueUrl: undefined,
    edit: undefined,
    addNewItem: undefined,
    showAddNewButton: Boolean(options.addNewButtonText),
    addNewButtonText: LocalizationService.get('CORE.FORM.EDITORS.REFERENCE.CREATENEW'),

    //deprecated options
    controller: undefined,
    storeArray: false,

    format: undefined //name of preset for editor
});

const presetsDefaults = {
    document: (options: optionsType) => ({
        listTitle: options.title,
        panelClass: 'datalist-panel__formatted',
        buttonBubbleTemplate: compiledCompositeDocumentCell,
        panelBubbleTemplate: compiledCompositeDocumentCell,
        valueType: 'normal',
        showCollection: false,
        idProperty: 'uniqueId',
        showSearch: false,
        addNewItem: datalistView => datalistView.boundEditor.openFileUploadWindow(),
        boundEditor: DocumentEditorView,
        boundEditorOptions: {
            multiple: options.maxQuantitySelected !== 1
        },
        addNewButtonText: (isEmpty : boolean) : string => {
            let addNameButtonText = 'CORE.FORM.EDITORS.DOCUMENT.ADDDOCUMENT';
            if (options.maxQuantitySelected === 1) {
                if (!isEmpty) {
                    addNameButtonText = 'CORE.FORM.EDITORS.DOCUMENT.REPLACEDOCUMENT';
                }
                return LocalizationService.get(addNameButtonText);
            }
            return LocalizationService.get(addNameButtonText);
        }
    }),
    user: (options: optionsType) => ({
        selectedTitle: LocalizationService.get('CORE.FORM.EDITORS.MEMBERSELECT.SELECTEDUSERS'),
        panelClass: 'datalist-panel__formatted',
        buttonBubbleTemplate: compiledCompositeUserCell,
        panelBubbleTemplate: compiledCompositeUserCell
    })
};

const stop = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
};

/* Some DOCS
    Datalist fetch [searched] data from collection on click if fetchFiltered true.

    Datalist filter state store in view.searchText(trim and upperCase) and input value (raw).

    ToDo:
    1.defaultOptions:displayAttribute should be text.
    2.getDisplayText should return string always. (String(returnedValue)).
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

        this.isButtonLimitMode = this.options.isButtonLimitMode;

        this.__createBoundEditor();

        this.__createPanelVirtualCollection();
        this.__createSelectedCollections();

        if (!this.options.fetchFiltered) {
            this.searchText = '';
        }
        this.debouncedFetchUpdateFilter = _.debounce(this.__fetchUpdateFilter, this.options.textFilterDelay);

        this.__getDisplayText = (value) => helpers.getDisplayText(value, this.options.displayAttribute, this.model, this.options.idProperty);

        const bubbleItemViewOptions = {
            getDisplayText: this.__getDisplayText,
            bubbleDelete: this.__onBubbleDelete.bind(this),
            edit: this.options.showEditButton ? this.options.edit : false,
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
                bubbleItemViewOptions: {
                    customTemplate: this.options.buttonBubbleTemplate,
                    ...bubbleItemViewOptions
                },
                selectedPanelCollection: this.isButtonLimitMode ? this.selectedPanelCollection : undefined,
                emptyPlaceholder: this.__getEmptyPlaceholder(),
                readonlyPlaceholder: this.__getReadonlyPlaceholder(),
                enabled: this.getEnabled(),
                readonly: this.getReadonly(),
                getFocusElementReadonly: (readonly: boolean) => readonly || !this.options.showSearch
            },
            panelView: PanelView,
            panelViewOptions: {
                class: this.options.panelClass,
                collection: this.panelCollection,
                showCollection: this.options.showCollection,
                selectedCollection: this.isButtonLimitMode ? this.selectedPanelCollection : undefined,
                addNewItem: this.options.addNewItem && this.__panelAddNewItem.bind(this),
                addNewButtonTextWrapper: () => _.getResult(this.options.addNewButtonText, this, this.isEmptyValue()),
                showAddNewButton: this.options.showAddNewButton,
                addNewButtonText: this.options.addNewButtonText,
                bubbleItemViewOptions: {
                    customTemplate: this.options.panelBubbleTemplate,
                    ...bubbleItemViewOptions
                },
                showCheckboxes: this.options.showCheckboxes,
                listItemView: this.options.showAdditionalList ? this.options.listItemViewWithText : this.options.listItemView,
                getDisplayText: this.__getDisplayText,
                canAddItem: this.__canAddItem.bind(this),
                subTextOptions: {
                    subtextProperty: this.options.subtextProperty,
                    iconProperty: this.options.iconProperty,
                    metaIcons: this.options.metaIcons
                },
                listTitle: this.options.listTitle,
                idProperty: this.options.idProperty,
                selectedTitle: this.options.selectedTitle,
                showSelectedTitle: this.options.showSelectedTitle,
                textFilterDelay: this.options.textFilterDelay
            },
            autoOpen: false,
            renderAfterClose: false,
            externalBlurHandler: this.options.externalBlurHandler,
            minAvailableHeight: this.options.minAvailableHeight
        });

        this.__addButtonListeners();

        this.__fetchOptionsQueue = new Set();
    },

    __getEmptyPlaceholder(isEmpty = this.isEmptyValue()) {
        return isEmpty ? (this.options.showSearch ? this.options.emptyPlaceholder : '-') : '';
    },

    __getReadonlyPlaceholder(isEmpty = this.isEmptyValue()) {
        return isEmpty ? this.options.readonlyPlaceholder : '';
    },

    __mapDatalistOptions(options: optionsType) {
        let defaults;
        if (typeof options.format === 'string') {
            const presetFn = presetsDefaults[options.format];
            const preset = presetFn ? presetFn(options) : {};
            const mergeOptions = _.defaults(preset, options);
            defaults = _.defaults(mergeOptions, defaultOptions(mergeOptions));
        } else {
            defaults = defaultOptions(options);
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
        this.listenTo(btn, 'blur', this.__onButtonBlur);
        this.listenTo(btn, 'input:keydown', this.__onInputKeydown);
        this.listenTo(btn, 'input:search', this.__onInputSearch);
        this.listenTo(btn, 'click', (e: MouseEvent) => {
            if (e.target?.tagName === 'A') {
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
            value: this.value,
            ...this.options.boundEditorOptions
        });
        this.setValue(this.boundEditor.getValue());
        this.__bindEditorsState();
    },

    __bindEditorsState() {
        this.listenTo(this.boundEditor, 'set:loading', this.setLoading.bind(this));
        this.listenTo(this.boundEditor, 'change', () => this.setValue(this.boundEditor.getValue(), { triggerChange: true }));
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

        this.__onPanelSelected = _.debounce(this.__onPanelSelected, 0);
        this.__onPanelDeselected = _.debounce(this.__onPanelDeselected, 0);
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

    __toggleSelectAddNewButton(state: boolean) {
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

    setValue(value, { triggerChange = false, isLoadIfNeeded = true } = {}): void {
        this.__value(value, { triggerChange, isLoadIfNeeded });
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

    __togglePlaceholder(isEmpty: boolean) {
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

    __convertToObject(value): Object {
        return this.__adjustValue(value);
    },

    setPermissions(enabled: boolean, readonly: boolean) {
        BaseEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.dropdownView.setPermissions(enabled, readonly);
        this.dropdownView.collectionView.updateEnabled(this.getEditable());
    },

    focus(): void {
        this.__focusButton({
            isNextFocusInner: false
        });
    },

    blur(): void {
        // TODO clean up all, except this.__blurButton();
        this.__setInputValue('');
        this.__blurButton();
        this.panelCollection.pointOff();
        this.__getSelectedBubble()?.deselect();
        this.__toggleSelectAddNewButton(false);
    },

    isButtonFocus() {
        const inputView = this.dropdownView;
        return inputView && inputView.ui.input[0] === document.activeElement;
    },

    isThisFocus() {
        return this.editorEl.contains(document.activeElement);
    },

    __clearSearch() {
        this.__startSearch('', { open: false });
    },

    __startSearch(string: string, options) {
        this.__setInputValue(string);
        this.__fetchUpdateFilter(string, options);
    },

    __getInputValue(): string {
        return this.dropdownView ? this.dropdownView.getInputValue() : '';
    },

    __setInputValue(string: string) {
        this.dropdownView.setInputValue(string);
    },

    __onInputSearch(button, e): void {
        if (this.options.fetchFiltered) {
            this.triggerNotReady();
        }
        this.debouncedFetchUpdateFilter();
    },

    __fetchUpdateFilter(
        text = this.__getInputValue(),
        { forceCompareText = this.options.fetchFiltered && !this.isLastFetchSuccess, openOnRender = false, open = true, selected = this.value } = {}
    ) {
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
            return this.__fetchDataAndOpen(this.searchText, { openOnRender, open, selected });
        }

        this.__filterPanelCollection(this.searchText);
        open && this.open(openOnRender);
    },

    async __fetchDataAndOpen(fetchedDataForSearchText: string, options: { open: boolean, openOnRender: boolean, selected: any }) {
        this.__fetchOptionsQueue.add(options);
        this.triggerNotReady();
        this.panelCollection.pointOff();
        try {
            const collection = this.options.collection;
            await collection.fetch({ data: { filter: fetchedDataForSearchText, selected: options.selected } });

            if (this.searchText !== fetchedDataForSearchText) {
                throw new Error('searched was updated');
            }

            this.__tryPointFirstRow();
            this.__updateSelectedOnPanel();

            this.isLastFetchSuccess = true;
            const { open, openOnRender } = options;
            open && this.open(openOnRender);

            this.triggerReady(); //don't move to finally, recursively.
            this.__fetchOptionsQueue.delete(options);
        } catch (e) {
            console.log(e);
            this.isLastFetchSuccess = false;
            this.triggerReady();
            this.__fetchOptionsQueue.delete(options);
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

    __resetSelectedCollection(models: Array<Object>  | Object | undefined | null): void {
        if (!this.selectedCollection) {
            return;
        }

        // logic this method is
        // this.selectedCollection.reset(models == null ? undefined : models);
        // select selected after reset

        const selectedIds = Object.values(this.selectedCollection.selected).map((selectedModel: Backbone.Model) => selectedModel.get(this.options.idProperty));

        const arrayOfAttributes = models == null ? [] : this.__toJSON(models);

        this.selectedCollection.set(arrayOfAttributes, {
            add: true,
            remove: true, // remove others (like reset)
            merge: true // current models can has no display text
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

        if (this.panelCollection.length > 0 && this.value) {
            if (this.options.maxQuantitySelected === 1) {
                if (this.options.showCheckboxes) {
                    if (this.options.storeArray && Array.isArray(this.value)) {
                        this.value.forEach(value => this.__setValueToPanelCollection(value));
                    } else {
                        this.__setValueToPanelCollection(this.value);
                    }
                }
            } else {
                this.value.forEach(value => this.__setValueToPanelCollection(value));
            }
        }
    },

    __setValueToPanelCollection(value) {
        const id = value && value[this.options.idProperty] !== undefined ? value[this.options.idProperty] : value;

        this.panelCollection.get(id)?.select({ isSilent: true });
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
                this.__tryPointFirstRow();
            }
        }
    },

    close() {
        this.debouncedFetchUpdateFilter.cancel();
        this.__fetchOptionsQueue.forEach(options => options.open = false);
        this.dropdownView.close();
    },

    __adjustValue(value: any, isLoadIfNeeded = false): Object | Array<Object> | null {
        if (this.isEmptyValue(value)) {
            return this.options.maxQuantitySelected === 1 ? null : [];
        }
        const result = this.valueTypeId ? this.__adjustValueForIdMode(value, isLoadIfNeeded) : value;
        return result;
    },

    __adjustValueForIdMode(value: any, isLoadIfNeeded: boolean): Object {
        if (this.options.fetchFiltered && isLoadIfNeeded && !this.isLastFetchSuccess && this.options.collection.length === 0) {
            this.listenToOnce(this, 'view:ready', () => {
                this.setValue(value, { isLoadIfNeeded: false });
            });
            this.__fetchUpdateFilter('', { forceCompareText: true, selected: value });
        }
        return this.__adjustValueFromLoaded(value);
    },

    __adjustValueFromLoaded(value: any): Object {
        if (Array.isArray(value)) {
            return value.map(v => this.__getValueFromCollection(v));
        }
        return this.__getValueFromCollection(value);
    },

    __getValueFromCollection(primitive: any): Object {
        // not use get, because 1. get(null) => undefined; 2. this.options.collection may be array or collection.
        let array = this.options.collection;

        if (array instanceof Backbone.Collection) {
            array = array.toJSON();
        }
        return (
            array.find(
                (object: { [key: string]: any }) => object[this.options.idProperty] == primitive // eslint-disable-line eqeqeq
            ) || this.__tryToCreateAdjustedValue(primitive)
        );
    },

    __tryToCreateAdjustedValue(primitive) {
        return {
            [this.options.idProperty]: primitive,
            text: this.__isValueEqualNotSet(primitive) ? LocalizationService.get('CORE.COMMON.NOTSET') : undefined
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

    __onSpaceValueSelect(): void {
        if (this.panelCollection.lastPointedModel) {
            this.panelCollection.lastPointedModel.toggleSelected();
        }
    },

    __onEnterValueSelect(event: KeyboardEvent): void {
        if (this.dropdownView.isOpen) {
            const lastPointedModel = this.panelCollection.lastPointedModel;

            if (lastPointedModel && !lastPointedModel.selected) {
                this.panelCollection.lastPointedModel.toggleSelected();
            }
            
            this.__toggleDropdown();
            stop(event);
        }   
    },

    __onPanelSelected(model: Backbone.Model, options = {}): void {
        if (options.isSilent) {
            return;
        }
        this.__focusButton();
        if (this.__canAddItem()) {
            const valueObject = model ? model.toJSON() : null;
            const value = this.__convertToValue(valueObject);

            if (this.options.maxQuantitySelected === 1) {
                this.__value(value, { triggerChange: true });
                this.panelCollection.selectNone({ isSilent: true });
                this.__closeAfterPanelSelected();
                return;
            }

            this.__value(this.value.concat(value), { triggerChange: true });
        } else {
            model.deselect({ isSilent: true });
        }

        const canAddItem = this.__canAddItem();
        canAddItem === false && this.dropdownView.panelView?.toggleSelectable(false);

        if (!canAddItem) {
            this.__closeAfterPanelSelected();
        } else {
            this.__clearSearch();
        }
    },

    __closeAfterPanelSelected() {
        this.__setInputValue('');
        this.close();
    },

    __onPanelDeselected(model: Backbone.Model, options = {}): void {
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

    __onButtonFocus(view: Marionette.View<any>, event: Event) {
        this.onFocus();
        if (this.isNextFocusInner) {
            event.stopImmediatePropagation();
            this.isNextFocusInner = false;
            return;
        }
        this.__onInputSearch();
    },

    __onButtonBlur(view: Marionette.View<any>, event: FocusEvent) {
        const relatedTarget = event.relatedTarget;
        if (this.dropdownView.panelView?.el.contains(relatedTarget) || this.dropdownView.el.contains(relatedTarget)) {
            // button will be focus after timeout
            return;
        }
        this.onBlur(event, {
            triggerChange: false
        });
    },

    __focusButton({ isNextFocusInner = true } = {}): void {
        if (this.isButtonFocus()) {
            return;
        }
        this.isNextFocusInner = isNextFocusInner;
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

    __onBubbleDelete(model: Backbone.Model): void {
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

    __onInputKeydown(button: Marionette.View<any>, e: KeyboardEvent) {
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
            if (e.keyCode !== keyCode.ESCAPE && e.keyCode !== keyCode.ENTER) {
                this.open();
            }
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

    __panelKeydown(e: KeyboardEvent) {
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
                this.__onEnterValueSelect(e);
                break;
            case keyCode.SPACE:
                stop(e);
                this.__onSpaceValueSelect();
                break;
            default:
                this.__isQuantityControl = false;
                break;
        }
    },

    __addNewItemKeydown(e: KeyboardEvent) {
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
                if (this.__isAddNewButtonSelect) {
                    this.__panelAddNewItem();
                    this.__toggleSelectAddNewButton(false);
                }
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
        if (!this.options.showAddNewButton) {
            return;
        }
        this.__focusButton();
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
            this.__isQuantityControl
            || [keyCode.UP, keyCode.DOWN, keyCode.ENTER].includes(e.keyCode) // || this.__checkEntryToPanel(e);
            || this.__checkEntryToBubbles(e)
        );
    },

    __checkEntryToBubbles(e) {
        const input = e.target;
        return input.selectionEnd === 0 && [keyCode.LEFT, keyCode.BACKSPACE].includes(e.keyCode);
    },

    __checkEntryToPanel(e) {
        const input = e.target;
        return input.selectionEnd === 0 && ![keyCode.UP, keyCode.DOWN].includes(e.keyCode);
    },

    __checkExitFromPanelControlToBubble(e) {
        const __isFirstPanelRowSelected = () => this.panelCollection.indexOf(this.panelCollection.lastPointedModel) === 0;
        return (
            this.selectedCollection.length &&
            (!this.panelCollection.length || (__isFirstPanelRowSelected() && [keyCode.LEFT, keyCode.UP].includes(e.keyCode)) || e.keyCode === keyCode.BACKSPACE)
        );
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

        this.panelCollection.trigger('moveCursorBy', delta, { isLoop: false, shiftPressed: false });
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

    setLoading(state: boolean) {
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
        this.listenTo(this.panelCollection, 'selected', this.__onPanelSelected);
        this.listenTo(this.panelCollection, 'deselected', this.__onPanelDeselected);
        this.trigger('dropdown:open');
    },

    __onDropdownClose() {
        this.stopListening(this.panelCollection, 'selected', this.__onPanelSelected);
        this.stopListening(this.panelCollection, 'deselected', this.__onPanelDeselected);
        this.trigger('dropdown:close');
    }
}));
