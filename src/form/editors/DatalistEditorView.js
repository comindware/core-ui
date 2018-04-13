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
    canDeleteItem: true
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
 * @param {Marionette.ItemView} [options.buttonView=ReferenceButtonView] view to display button (what we click on to show dropdown).
 * @param {Marionette.ItemView} [options.listItemView=ReferenceListItemView] view to display item in the dropdown list.
 * @param {String} [options.displayAttribute='name'] The name of the attribute that contains display text.
 * @param {Boolean} [options.canDeleteItem=true] Возможно ли удалять добавленные бабблы.
 * @param {Number} [options.maxQuantitySelected] Максимальное количество пользователей, которое можно выбрать.
 * */
export default (formRepository.editors.Datalist = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        _.bindAll(this, '__getDisplayText');

        this.reqres = Backbone.Radio.channel(_.uniqueId('datalistE'));

        this.controller
            = this.options.controller
            || new StaticController({
                collection: options.collection
            });

        this.reqres.reply('bubble:delete', this.__onBubbleDelete, this);
        this.reqres.reply('bubble:delete:last', this.__onBubbleDeleteLast, this);
        this.reqres.reply('input:search', this.__onInputSearch, this);
        this.reqres.reply('input:up', this.__onInputUp, this);
        this.reqres.reply('input:down', this.__onInputDown, this);
        this.reqres.reply('button:click', this.__onButtonClick, this);
        this.reqres.reply('value:select', this.__onValueSelect, this);
        this.reqres.reply('value:edit', this.__onValueEdit, this);
        this.reqres.reply('filter:text', this.__onFilterText, this);
        this.reqres.reply('add:new:item', this.__onAddNewItem, this);
        this.reqres.reply('view:ready', this.__triggerReady, this);

        this.panelCollection = new VirtualCollection(new ReferenceCollection(options.collection ? options.collection.toJSON() : []), { selectableBehavior: 'multi' });

        this.value = this.__adjustValue(this.value);

        const selectedModels = new Backbone.Collection(this.getValue(), {
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'text')
        });

        this.viewModel = {
            button: {
                selected: selectedModels
            },
            panel: new Backbone.Model({
                value: this.getValue(),
                collection: this.panelCollection,
                totalCount: this.controller.totalCount || 0
            })
        };

        this.listenTo(this.panelCollection, 'selected', this.__onValueSet);
        this.listenTo(this.panelCollection, 'deselected', this.__onValueUnset);

        this.__updateFakeInputModel();
    },

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'editor editor_bubble',

    template: Handlebars.compile(template),

    setValue(value): void {
        this.value = [];
        this.viewModel
            .button
            .selected
            .reset();
        this.__value(value, false);
        delete this.fakeInputModel;
        this.__updateFakeInputModel();
    },

    onRender(): void {
        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: this.options.buttonView,
            buttonViewOptions: {
                model: this.viewModel.button,
                reqres: this.reqres,
                getDisplayText: this.__getDisplayText,
                showEditButton: this.options.showEditButton,
                createValueUrl: this.controller.createValueUrl.bind(this.controller),
                enabled: this.getEnabled(),
                readonly: this.getReadonly()
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.viewModel.panel,
                reqres: this.reqres,
                showAddNewButton: this.options.showAddNewButton,
                showCheckboxes: this.options.showCheckboxes,
                listItemView: this.options.listItemView,
                getDisplayText: this.__getDisplayText,
                textFilterDelay: this.options.textFilterDelay
            },
            autoOpen: false
        });
        this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
        this.listenTo(this.dropdownView, 'close', this.__onDropdownClose);

        this.dropdownRegion.show(this.dropdownView);
    },

    isEmptyValue(): boolean {
        const value = this.getValue();
        return !value || !value.length;
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
    },

    __adjustValue(value: DataValue): any {
        if (typeof value === 'string' && value) {
            return this.panelCollection.get(value) || [];
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
        selectedModels.add(value, { at: selectedModels.length - 1 });
        this.viewModel.panel.set('value', this.value);

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __onValueSelect(): void {
        if (this.panelCollection.lastPointedModel) {
            this.panelCollection.lastPointedModel.toggleSelected();
        } else {
            this.__onValueSet(this.panelCollection.selected);
        }
    },

    __onValueSet(model?: Backbone.Model): void {
        const canAddItemOldValue = this.__canAddItem();
        const value = model ? model.toJSON() : null;
        this.__value(value, true);
        this.__updateFakeInputModel();

        if (this.options.maxQuantitySelected === 1) {
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

        return this.getEnabled() && !this.getReadonly() && (!this.options.maxQuantitySelected || this.options.maxQuantitySelected !== selectedItems.length);
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

    __getDisplayText(value) {
        if (!value) {
            return '';
        }
        return value[this.options.displayAttribute] || value.text || `#${value.id}`;
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

        const selected = [].concat(this.getValue());
        const removingModelIndex = selected.findIndex(s => s.id === model.get('id'));
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
