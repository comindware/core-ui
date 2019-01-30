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
import DefaultReferenceModel from './impl/datalist/models/DefaultReferenceModel';
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
    fetchFiltered: false,
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
    customTemplate: undefined,

    //dropdown options
    externalBlurHandler: undefined,
    minAvailableHeight: undefined,

    //controller's methods
    createValueUrl: undefined,
    edit: undefined,
    addNewItem: undefined,

    //deprecated options
    controller: null,
    storeArray: false
};
/* Some DOCS
    Datalist fetch [searched] data from controller on click

    ToDo:
    1.Check the need close panel on add new Item, and then pass controller's methods as button's options.
    2.Pass collection from options for options for panelVirtualCollection, for remove reset listener.
    3.Fix bug: valueTypeId, many: if model already has displayText, collection has no this el, on delete some, another will be #.
    4.Fix focus logic (make as dateTime).
    4.defaultOptions:displayAttribute should be text.
    5.getDisplayText should return string always. (String(returnedValue)).
    6.if showCheckboxes and maxQuantitySelected === 1, checkbox not checked.
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
        this.valueTypeId = this.options.valueType === 'id';

        let collection = [];
        if (options.collection) {
            if (Array.isArray(options.collection)) {
                collection = options.collection;
            } else {
                collection = options.collection.toJSON();
                this.listenTo(options.collection, 'reset', this.resetCollection);
            }
        }

        this.array = collection;
        this.panelCollection = new VirtualCollection(new ReferenceCollection(collection), {
            isSliding: true,
            selectableBehavior: 'multi'
        });

        this.__createSelectedButtonCollection();

        if (!this.options.fetchFiltered) {
            this.searchText = '';
        }
        this.debouncedFetchUpdateFilter = _.debounce(this.__fetchUpdateFilter, this.options.textFilterDelay);
        this.listenTo(this.panelCollection, 'selected', this.__onValueSet);
        this.listenTo(this.panelCollection, 'deselected', this.__onValueUnset);

        const reqres = Backbone.Radio.channel(_.uniqueId('datalistE'));

        this.reqres = reqres;

        reqres.reply({
            'bubble:delete': this.__onBubbleDelete.bind(this),
            'input:keydown': this.__onInputKeydown.bind(this),
            'input:search': this.__onInputSearch.bind(this),
            'button:click': this.__onButtonClick.bind(this),
            'value:edit': this.__onValueEdit.bind(this),
            'add:new:item': this.__onAddNewItem.bind(this)
        });

        this.__getDisplayText = this.__getDisplayText.bind(this);

        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: this.options.buttonView,
            buttonViewOptions: {
                value: '',
                collection: this.selectedButtonCollection,
                reqres,
                getDisplayText: this.__getDisplayText,
                showEditButton: Boolean(this.options.edit),
                customTemplate: this.options.customTemplate,
                canDeleteItem: this.options.maxQuantitySelected > 1 ? this.options.canDeleteItem : this.options.allowEmptyValue,
                createValueUrl: this.options.createValueUrl,
                datalistEnabled: this.getEnabled(),
                datalistReadonly: this.getReadonly(),
                emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET'),
                readonlyPlaceholder: '--',
                readonly: this.__isInputShouldBeReadonly()
            },
            panelView: PanelView,
            panelViewOptions: {
                class: this.options.panelClass,
                collection: this.panelCollection,
                reqres,
                showAddNewButton: Boolean(this.options.addNewItem),
                showCheckboxes: this.options.showCheckboxes,
                listItemView: this.options.showAdditionalList ? this.options.listItemViewWithText : this.options.listItemView,
                getDisplayText: this.__getDisplayText,
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

    __isInputShouldBeReadonly() {
        return !this.options.showSearch || this.getReadonly();
    },

    __createSelectedButtonCollection() {
        this.selectedButtonCollection = new (Backbone.Collection.extend({
            model: Backbone.Model.extend({
                initialize() {
                    _.extend(this, new SelectableBehavior.Selectable(this));
                }
            })
        }))();

        _.extend(this.selectedButtonCollection, new SelectableBehavior.SingleSelect(this.selectedButtonCollection));
    },

    regions: {
        dropdownRegion: {
            el: '.js-dropdown-region',
            replaceElement: true
        }
    },

    className() {
        _.defaults(this.options, this.options.schema || this.options, defaultOptions);
        if (this.options.controller) {
            const controller = this.options.controller;

            this.options.fetchFiltered = true;

            this.options.collection = controller.collection.parentCollection;

            this.options.createValueUrl = controller.createValueUrl;
            this.options.edit = controller.edit;
            this.options.addNewItem = controller.addNewItem;
        }

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

        return `${this.options.class || ''} editor editor_bubble ${classList.join(' ')}`;
    },

    template: Handlebars.compile(template),

    setValue(value): void {
        this.__value(value, false, true);
    },

    onRender(): void {
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.__onDropdownClose);

        this.showChildView('dropdownRegion', this.dropdownView);
    },

    isEmptyValue(value = this.getValue()): boolean {
        return value == null || (Array.isArray(value) && value.length === 0);
    },

    __updateEmpty() {
        const isEmpty = this.isEmptyValue();
        BaseEditorView.prototype.__updateEmpty.call(this, isEmpty);
        this.dropdownView?.button.togglePlaceholder(isEmpty);
    },

    __convertToValue(estimatedObjects) {
        if (this.getOption('valueType') === 'id') {
            return Array.isArray(estimatedObjects) ?
                estimatedObjects.map(value => value && value.id) :
                estimatedObjects && estimatedObjects.id;
        }
        return estimatedObjects;
    },

    __convertToObject(value) {
        this.__adjustValue(value);
    },

    setPermissions(enabled, readonly) {
        BaseEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.dropdownView.button?.setPermissions(enabled, this.__isInputShouldBeReadonly());
        this.dropdownView.button?.togglePlaceholder(!readonly && this.isEmptyValue());
        this.dropdownView.button?.collectionView?.updateEnabled(this.getEditable());
    },

    focus(): void {
        this.__focusButton();
        this.onFocus();
    },

    blur(): void {
        this.__setInputValue('');
        this.__blurButton();
        this.onBlur(undefined, {
            triggerChange: false
        });
    },

    isButtonFocus() {
        const inputView = this.dropdownView?.button;
        return inputView && inputView.ui.input[0] === document.activeElement;
    },

    isThisFocus() {
        return this.el.contains(document.activeElement);
    },

    __clearSearch() {
        this.__startSearch('');
    },

    __startSearch(string) {
        this.__setInputValue(string);
        this.debouncedFetchUpdateFilter(string);
    },

    __getInputValue() {
        return this.dropdownView.button ?
            this.dropdownView.button.getInputValue() :
            '';
    },

    __setInputValue(string) {
        this.dropdownView.button?.setInputValue(string);
    },

    __onInputSearch(value = this.__getInputValue()): void {
        if (this.options.fetchFiltered) {
            this.triggerNotReady();
        }
        this.debouncedFetchUpdateFilter(value);
    },

    __fetchUpdateFilter(value, forceCompareText = this.options.fetchFiltered && !this.isLastFetchSuccess, openOnRender = false) {
        const searchText = (value || '').toUpperCase().trim();
        if (this.searchText === searchText && !forceCompareText) {
            this.__updateSelectedOnPanel();
            this.open(openOnRender);
            return;
        }
        this.searchText = searchText;
        this.__setInputValue(searchText.toLowerCase());

        if (this.options.fetchFiltered) {
            return this.__fetchDataAndOpen(this.searchText, openOnRender);
        }

        this.__filterPanelCollection(this.searchText);
        this.open(openOnRender);
    },

    async __fetchDataAndOpen(fetchedDataForSearchText, openOnRender) {
        this.triggerNotReady();
        this.panelCollection.pointOff();
        try {
            const collection = this.options.collection;
            await collection.fetch({ data: { filter: fetchedDataForSearchText } });

            if (this.searchText !== fetchedDataForSearchText) {
                throw new Error('searched was updated');
            }

            this.__resetPanelVirtualCollection({
                collection: collection.toJSON(),
                totalCount: collection.length
            });

            this.isLastFetchSuccess = true;
            this.open(openOnRender);
            this.triggerReady(); //don't move to finally, recursively.
        } catch (e) {
            this.isLastFetchSuccess = false;
            this.triggerReady();
        }
    },

    __filterPanelCollection(searchText) {
        const filteredModels = this.array.filter(attributes => {
            const displayText = this.__getDisplayText(attributes);
            if (!displayText) {
                return false;
            }
            return String(displayText).includes(searchText);
        });

        this.__resetPanelVirtualCollection({
            collection: filteredModels,
            totalCount: filteredModels.length
        });
    },

    __resetSelectedCollection(models) {
        if (!this.selectedButtonCollection) {
            return;
        }

        // this.selectedButtonCollection.reset(models == null ? undefined : models);
        // select selected after reset

        this.selectedButtonCollection.set(
            models == null ? [] : models,
            {
                add: true,
                remove: true, // remove others (like reset)

                // current models can has no display text for valueType = 'id
                merge: this.valueTypeId // add condition: some models has "#"
            }
        );

        this.dropdownView?.button?.trigger('change:content');
    },

    __resetPanelVirtualCollection({ collection, totalCount }) {
        this.panelCollection.totalCount = totalCount;
        this.panelCollection.reset(collection);

        this.__updateSelectedOnPanel();
        this.__tryPointFirstRow();
    },

    __updateSelectedOnPanel() {
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

        this.listenTo(this.dropdownView.button, 'focus', this.__onButtonFocus);
    },

    adjustPosition(isNeedToRefreshAnchorPosition) {
        if (this.dropdownView) {
            this.dropdownView.adjustPosition(isNeedToRefreshAnchorPosition);
        }
    },

    getIsOpenAllowed(openOnRender) {
        const skipFocusCheck = openOnRender;
        return skipFocusCheck ?
            this.getEditable() && !this.dropdownView.isOpen :
            this.getEditable() && !this.dropdownView.isOpen && this.isThisFocus();
    },

    open(openOnRender) {
        if (this.getIsOpenAllowed(openOnRender)) {
            if (this.options.fetchFiltered && this.isLastFetchSuccess === undefined) {
                this.__fetchUpdateFilter('');
            } else if (!this.__getSelectedBubble()) {
                this.dropdownView.open();
                this.__focusButton();
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
            this.__fetchUpdateFilter('', true);
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
        // eslint-disable-next-line eqeqeq
        return this.array.find(attributes => attributes.id == primitive) ||
            this.__tryToCreateAdjustedValue(primitive);
    },

    __tryToCreateAdjustedValue(primitive) {
        return ({
                    id: primitive,
                    text: this.__isValueEqualNotSet(primitive) ?
                        Localizer.get('CORE.COMMON.NOTSET') :
                        undefined
                });
    },

    __isValueEqualNotSet(value) {
        return value == null || value === 'Undefined';
    },

    isValueIncluded(value) {
        if (this.valueTypeId) {
            if (_.isObject(value)) {
                return this.value.some(v => v === value.id);
            }
            return this.value.includes(value);
        }
        return this.value.some(v => v.id === (_.isObject(value) ? value.id : value));
    },

    __value(value, triggerChange = false, isLoadIfNeeded = false) {
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
        this.array = collection.toJSON();
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
                this.panelCollection.selectNone({isSilent: true});
                this.close();
                this.__setInputValue('');
                return;
            }

            this.__value(this.value.concat(value), true);
        }

        if (!this.__canAddItem()) {
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
        this.__focusButton();
        this.__onBubbleDelete(model);
    },

    __canAddItem(): boolean {
        const isAccess = this.getEditable();
        const maxQuantity = this.options.maxQuantitySelected;

        if (maxQuantity === 1) {
            return true;
        }

        return isAccess && maxQuantity > this.selectedButtonCollection.length;
    },

    __onValueEdit(value) {
        return this.options.edit && this.options.edit(value);
    },

    __onAddNewItem(): void {
        this.close();
        return this.options.addNewItem && this.options.addNewItem();
    },

    __getDisplayText(value, displayAttribute = this.options.displayAttribute): string {
        if (value == null) {
            return '';
        }
        if (typeof displayAttribute === 'function') {
            return displayAttribute(value, this.model);
        }
        return value[displayAttribute] || value.text || `#${value.id}`;
    },

    __onButtonFocus() {
        if (this.isNextFocusInner) {
            this.isNextFocusInner = false;
            return;
        }
        this.isNextFocusInner = false;
        this.__onInputSearch();
    },

    __focusButton(): void {
        if (this.isButtonFocus()) {
            return;
        }
        this.isNextFocusInner = true;
        this.dropdownView.button?.focus();
    },

    __blurButton(): void {
        this.dropdownView.button?.blur();
    },

    __onButtonClick(filterValue = '', forceCompareText = this.options.fetchFiltered, openOnRender = false): void {
        if (!this.getEditable()) {
            return;
        }
        this.debouncedFetchUpdateFilter(filterValue, forceCompareText, openOnRender);
        if (!this.showSearch) {
            this.__focusButton();
        }
    },

    __onBubbleDelete(model: Backbone.Model): Backbone.Model {
        if (!model) {
            return;
        }

        if (!(this.selectedButtonCollection.length === 1 && !this.options.allowEmptyValue)) {
            model.deselect({ isSilent: true });
            this.panelCollection.get(model.id)?.deselect({ isSilent: true });
    
            const selected = [].concat(this.getValue() || []);
            const removingModelIndex = selected.findIndex(s => (s && s.id !== undefined ? s.id : s) === model.get('id'));
            if (removingModelIndex !== -1) {
                selected.splice(removingModelIndex, 1);
            }
    
            this.__value(selected, true);
        }

        this.__focusButton();

        if (!this.dropdownView.isOpen) {
            this.__onButtonClick();
        }
    },

    __onBubbleDeleteLast(): void {
        const model = this.selectedButtonCollection.models[this.selectedButtonCollection.models.length - 1];

        this.__onBubbleDelete(model);
    },

    __onInputKeydown(e) {
        if (!this.getEditable()) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        const input = e.target;
        let selectedBubble;
        let selectedBubbleIndex;
        switch (e.keyCode) {
            case keyCode.UP:
                e.preventDefault();
                selectedBubble = this.__getSelectedBubble();
                selectedBubble && selectedBubble.deselect();
                this.__onInputUp(e);
                e.stopPropagation();
                break;
            case keyCode.DOWN:
                e.preventDefault();
                this.__getSelectedBubble()?.deselect();
                this.__onInputDown(e);
                e.stopPropagation();
                break;
            case keyCode.RIGHT:
                selectedBubble = this.__getSelectedBubble();
                if (selectedBubble) {
                    e.preventDefault();
                    selectedBubbleIndex = this.selectedButtonCollection.indexOf(selectedBubble);
                    if (selectedBubbleIndex === this.selectedButtonCollection.length - 1) {
                        selectedBubble.deselect();
                        this.open();
                        break;
                    }
                    this.__selectBubbleBy(1, selectedBubble);
                    e.stopPropagation();
                }
                break;
            case keyCode.LEFT:
                selectedBubble = this.__getSelectedBubble();
                if (selectedBubble) {
                    e.preventDefault();
                    this.__selectBubbleBy(-1, selectedBubble);
                } else if (input.selectionEnd === 0) {
                    this.close();
                    this.__selectBubbleLast();
                    this.__setInputValue('');
                }
                e.stopPropagation();
                break;
            case keyCode.DELETE:
                selectedBubble = this.__getSelectedBubble();
                if (selectedBubble) {
                    this.__selectBubbleBy(1, selectedBubble);
                    this.__onBubbleDelete(selectedBubble);
                }
                e.stopPropagation();
                break;
            case keyCode.BACKSPACE:
                selectedBubble = this.__getSelectedBubble();
                if (selectedBubble) {
                    this.__selectBubbleBy(-1, selectedBubble);
                    this.__onBubbleDelete(selectedBubble);
                } else if (!input.value.trim()) {
                    this.close();
                    this.__selectBubbleLast();
                    this.__setInputValue('');
                }
                e.stopPropagation();
                break;
            case keyCode.ENTER:
                e.preventDefault();
                this.__onInputEnter();
                e.stopPropagation();
                break;
            default:
                this.__getSelectedBubble()?.deselect();
                break;
        }
    },

    __getSelectedBubble() {
        return Object.values(this.selectedButtonCollection.selected)[0];
    },
    
    __selectBubbleBy(delta, selectedBubble = this.__getSelectedBubble()) {
        if (!selectedBubble || !this.selectedButtonCollection.length) {
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
        const maxIndex = this.selectedButtonCollection.length - 1;

        return Math.max(Math.min(bubbleIndex, maxIndex), minIndex);
    },

    __selectBubbleLast() {
        if (!this.selectedButtonCollection.length) {
            return;
        }
        this.selectedButtonCollection.select(
            this.selectedButtonCollection.at(this.selectedButtonCollection.length - 1)
        );
    },

    __onInputUp(e): void {
        const collection = this.panelCollection;

        if (collection.indexOf(this.panelCollection.lastPointedModel) === 0) {
            this.close();
        } else {
            this.__sendPanelCommand('up');
        }
    },

    __onInputDown(e): void {
        if (!this.dropdownView.isOpen) {
            this.open();
        } else {
            this.__sendPanelCommand('down');
        }
    },

    __onInputEnter() {
        if (this.dropdownView.isOpen) {
            this.__onValueSelect();
        }
    },

    __sendPanelCommand(command: string, options: {}): void {
        if (this.dropdownView.isOpen) {
            this.dropdownView.panelView.handleCommand(command, options);
        }
    },

    //start fetch
    triggerNotReady() {
        this.isReady = false;
        this.dropdownView?.buttonView?.setLoading(true);
        this.trigger('view:notReady');
        return false;
    },

    //fetch complete
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
    }
}));
