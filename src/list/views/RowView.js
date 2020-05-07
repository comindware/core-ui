import { transliterator } from 'utils';
import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import _ from 'underscore';
import { classes } from '../meta';
import dropdown from 'dropdown';
import MobileService from '../../services/MobileService';
import CellViewFactory from '../CellViewFactory';
import { Column, GridItemModel } from '../types/types';
import { objectPropertyTypes, complexValueTypes } from '../../Meta';
import ErrorsPanelView from '../../views/ErrorsPanelView';
import { cmpPos } from 'codemirror';

const config = {
    TRANSITION_DELAY: 400
};

const defaultOptions = {
    levelMargin: 10,
    contextLevelMargin: 30,
    subGroupMargin: 20
};

/**
 * Some description for initializer
 * @name RowView
 * @memberof module:core.list.views
 * @class RowView
 * @extends Marionette.View
 * @constructor
 * @description View используемый по умолчанию для отображения строки списка
 * @param {Object} options Constructor options
 * @param {Array} options.columns Массив колонк
 * @param {Object} options.gridEventAggregator ?
 * @param {Number} [options.paddingLeft=20] Левый отступ
 * @param {Number} [options.paddingRight=10] Правый отступ
 * */
export default Marionette.View.extend({
    className: 'row',

    ui: {
        cells: '.js-grid-cell',
        collapsibleButton: '.js-collapsible-button'
    },

    events: {
        click: '__handleClick',
        dblclick: '__handleDblClick',
        'click @ui.collapsibleButton': '__toggleCollapse',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop',
        mouseenter: '__handleMouseEnter',
        mouseleave: '__handleMouseLeave',
        contextmenu: '__handleContextMenu'
    },

    modelEvents: {
        click: '__handleModelClick',
        dblclick: '__handleModelDblClick',
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        'select:pointed': '__selectPointed',
        'selected:enter': '__handleEnter',
        'selected:exit': '__handleExit',
        highlighted: '__handleHighlight',
        unhighlighted: '__handleUnhighlight',
        change: '__handleChange',
        dragover: '__handleModelDragOver',
        dragleave: '__handleModelDragLeave',
        drop: '__handleModelDrop',
        mouseenter: '__handleModelMouseEnter',
        mouseleave: '__handleModelMouseLeave',
        blink: '__blink',
        'toggle:collapse': 'updateCollapsed',
        validated: '__onValidated',
        checked: '__addCheckedClass',
        unchecked: '__removeCheckedClass'
    },

    initialize() {
        _.defaults(this.options, defaultOptions);
        this.gridEventAggregator = this.options.gridEventAggregator;
        this.columnClasses = this.options.columnClasses;
        this.collection = this.model.collection;
        this.cellConfigs = {};
        this.cellViewsByKey = {};
        this.options.columns.forEach((column: Column, index: number) => {
            this.cellConfigs[column.key] = { isHidden: column.getHidden?.(this.model) };
            if (typeof column.getHidden === 'function') {
                this.listenTo(this.model, 'change', () => this.__setCellHidden({ column, index, isHidden: Boolean(column.getHidden?.(this.model)) }));
            }
        });
    },

    getValue(id) {
        this.model.get(id);
    },

    onRender() {
        const model = this.model;

        if (model.selected) {
            this.__handleSelection();
            if (this.gridEventAggregator.isEditable && this.gridEventAggregator.pointedCell !== undefined) {
                this.__selectPointed(this.gridEventAggregator.pointedCell);
            }
        }
        if (model.highlighted) {
            this.__handleHighlight(model.highlightedFragment);
        }
        if (this.getOption('isTree')) {
            this.insertFirstCellHtml();
        }
        this.__updateValidationErrors();
    },

    onDestroy() {
        if (this.cellViewsByKey) {
            Object.values(this.cellViewsByKey).forEach(x => x.destroy());
            this.cellViewsByKey = {};
        }
        this.errorPopout?.close();
        this.multiValuePopout?.close();
    },

    updateCollapsed(model) {
        const collaspibleButtons = this.el.getElementsByClassName(classes.collapsibleIcon);
        if (!model.collapsed) {
            if (collaspibleButtons.length) {
                collaspibleButtons[0].classList.add(classes.expanded);
            }
        } else if (collaspibleButtons.length) {
            collaspibleButtons[0].classList.remove(classes.expanded);
        }
    },

    _renderTemplate() {
        if (typeof this.options.transliteratedFields === 'object') {
            transliterator.initializeTransliteration({
                model: this.model,
                transliteratedFields: this.options.transliteratedFields,
                schemaForExtendComputed: this.options.columns
            });
        }
        this.onDestroy();

        const itemsHTML: Array<string> = (this.itemsHTML = []);
        // if (this.getOption('showCheckbox')) {
        //     this.__insertCellChechbox();
        // }

        const customCells: Array<{ index: number, CellView: Marionette.View<Backbone.Model> }> = [];
        this.options.columns.forEach((column: Column, index: number) => {
            if (column.cellView) {
                customCells.push({ index, CellView: column.cellView });
            } else {
                const cellHTML = CellViewFactory.getCell(column, this.model);
                itemsHTML.push(cellHTML);
            }
        });
        this.el.innerHTML = this.itemsHTML.join('');
        customCells.forEach(({ index, CellView }) => {
            const cellView = this.__renderCell({ column: this.options.columns[index], index, CellView });
            if (index === 0) {
                this.el.insertAdjacentElement('afterbegin', cellView.el);
            } else {
                const childElBefore = this.__getCellByColumnIndex(index - 1);
                childElBefore.insertAdjacentElement('afterend', cellView.el);
            }
            cellView.triggerMethod('attach');
        });
    },

    __handleChange() {
        const changed = this.model.changedAttributes();
        if (!changed) {
            return;
        }
        this.getOption('columns').forEach((column: Column, index: number) => {
            if (!Object.prototype.hasOwnProperty.call(changed, column.key) || this.__isColumnEditable(index)) {
                return;
            }
            this.__insertReadonlyCell({ column, index, isReplace: true });
        });
    },

    __hasCellErrors(column: Column) {
        return column.required && _.isEmpty(this.model.get(column.key));
    },

    __handleDragStart(event: MouseEvent) {
        this.collection.draggingModel = this.model;
        event.originalEvent.dataTransfer.setData('Text', this.cid); // fix for FireFox
    },

    __handleDragEnd() {
        this.__handleDragLeave();
        delete this.collection.draggingModel;
    },

    __handleClick(event) {
        this.model.trigger('click', event);
    },

    __handleDblClick(event) {
        this.model.trigger('dblclick', event);
    },

    __handleDragOver(event) {
        event.preventDefault();
    },

    __handleDragEnter(event) {
        this.model.collection.dragoverModel = this.model;
        if (this.__allowDrop()) {
            this.model.trigger('dragover', event);
        }
    },

    __allowDrop() {
        const draggingModel = this.collection.draggingModel;
        if (!draggingModel) {
            return false;
        }
        if (this.collection.indexOf(this.model) + 1 === this.collection.indexOf(draggingModel) && this.model.level <= draggingModel.level) {
            return false;
        }
        return !this.__findInParents(draggingModel, this.model);
    },

    __findInParents(draggingModel: GridItemModel, model: GridItemModel): boolean {
        if (model === draggingModel) {
            return true;
        }
        if (model.parentModel) {
            return this.__findInParents(draggingModel, model.parentModel);
        }
        return false;
    },

    __handleModelDragOver() {
        this.el.classList.add(classes.dragover);
    },

    __handleDragLeave(event) {
        if (this.model.collection.dragoverModel !== this.model) {
            this.model.trigger('dragleave', event);
            delete this.model.dragover;
        }
    },

    __handleModelDragLeave() {
        this.el.classList.remove(classes.dragover);
    },

    __handleDrop(event) {
        event.preventDefault();
        if (this.__allowDrop()) {
            this.model.trigger('drop', event);
        }
    },

    __handleModelDrop() {
        this.el.classList.remove(classes.dragover);
    },

    __handleContextMenu(event) {
        this.model.trigger('contextmenu', event);
    },

    __handleHighlight(fragment) {
        this.model.set('highlightedFragment', fragment);
    },

    __handleUnhighlight() {
        this.cellViews.forEach(cellView => {
            cellView.model.set('highlightedFragment', null);
        });
        this.model.set('highlightedFragment', null);
    },

    insertFirstCellHtml(force: boolean) {
        const elements = this.el.children;
        if (!elements.length) {
            return;
        }
        const level = this.model.level || 0;
        let margin = level * this.options.levelMargin;
        const hasChildren = Boolean(this.model.children?.length);
        if (!force && this.lastHasChildren === hasChildren && this.lastMargin === margin) {
            return;
        }
        const el = this.__getCellByColumnIndex(0);
        const treeFirstCell = el.getElementsByClassName('js-tree-first-cell')[0];

        if (treeFirstCell?.parentElement === el) {
            el.removeChild(treeFirstCell);
        }

        const isContext = el.getElementsByClassName('context-icon')[0];
        if (isContext) {
            margin = level * this.options.contextLevelMargin;
            if (hasChildren) {
                el.insertAdjacentHTML(
                    'beforeend',
                    `<i class="${classes.collapsible} js-tree-first-cell context-collapsible-btn fa fa-angle-down ${this.model.collapsed === false ? classes.expanded : ''}"></i>`
                );
            }
            isContext.style.marginLeft = `${margin + defaultOptions.subGroupMargin}px`;
        } else if (hasChildren) {
            el.insertAdjacentHTML(
                'afterbegin',
                `<i class="js-tree-first-cell collapsible-btn ${classes.collapsible}
                 fa fa-angle-down ${this.model.collapsed === false ? classes.expanded : ''}" style="margin-left:${margin}px;"></i/`
            );
        } else {
            el.insertAdjacentHTML('afterbegin', `<span class="js-tree-first-cell" style="margin-left:${margin + defaultOptions.subGroupMargin}px;"></span>`);
        }
        this.lastHasChildren = hasChildren;
        this.lastMargin = margin;
    },

    __handleModelClick(e) {
        const model = this.model;

        const selectFn = model.collection.selectSmart || model.collection.select;
        const columnIndex = this.__getFocusedColumnIndex(e);
        const column = this.options.columns[columnIndex];
        if (selectFn) {
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey, undefined, {
                isModelClick: true
            });
        }
        if (column) {
            // todo: find more clear way to handle this case
            const target = e.target;
            const isErrorButtonClicked = target && target.classList.contains('js-error-button');
            const isFocusChangeNeeded = columnIndex !== this.lastPointedIndex && target && !isErrorButtonClicked;
            let isFocusEditor;
            if (
                this.__isColumnEditable(columnIndex) ||
                // temporary desicion for complex cells
                (column.type === 'Complex' && [complexValueTypes.expression, complexValueTypes.script].includes(this.model.get(column.key)?.type))
            ) {
                // change boolean value immediatly
                if (column.type === objectPropertyTypes.BOOLEAN && isFocusChangeNeeded) {
                    const newValue = column.storeArray ? [!this.model.get(column.key)?.[0]] : !this.model.get(column.key);
                    this.model.set(column.key, newValue);
                }
                isFocusEditor = true;
            } else {
                const values = this.model.get(column.key);
                if (values?.length > 1 && this.multiValueShownIndex !== columnIndex) {
                    this.__showDropDown(columnIndex);
                }
                isFocusEditor = false;
            }
            setTimeout(
                () => this.__selectPointed(columnIndex, isFocusEditor, isFocusChangeNeeded, isErrorButtonClicked),
                11 //need more than debounce delay in selectableBehavior calculateLength
            );
        }
        this.trigger('click', this.model);
    },

    __handleModelDblClick() {
        this.trigger('dblclick', this.model);
    },

    __addCheckedClass() {
        this.el.classList.add(classes.rowChecked);
    },

    __removeCheckedClass() {
        this.el.classList.remove(classes.rowChecked);
    },

    __showDropDown(index: number) {
        const column = this.options.columns[index];
        this.multiValuePopout = CellViewFactory.tryGetMultiValueCellPanel(column, this.model, this.__getCellByColumnIndex(index));
        if (this.multiValuePopout) {
            this.multiValuePopout.open();
            this.multiValuePopout.on('close', () => delete this.multiValueShownIndex);
            this.multiValueShownIndex = index;
        }
    },

    __getCellByColumnIndex(columnIndex: number): Element {
        const index = this.getOption('showCheckbox') ? columnIndex + 1 : columnIndex;
        const cellElement = this.el.children[index];

        return cellElement;
    },

    __getEditableCell(column: Column): Marionette.View<Backbone.Model> {
        return CellViewFactory.getCellViewForColumn(column, this.model);
    },

    __isColumnEditable(columnIndex: number): boolean {
        if (columnIndex < 0 || !this.gridEventAggregator.isEditable) {
            return false;
        }
        const column = this.getOption('columns')[columnIndex];
        return column.editable && (!column.getReadonly || !column.getReadonly(this.model)) && (!column.getHidden || !column.getHidden(this.model));
    },

    __insertEditableCell({ column, index, CellView }: { column: Column, index: number, CellView: Marionette.View<Backbone.Model> }) {
        const cellView = this.__renderCell({ column, index, CellView });
        const cellEl = this.__getCellByColumnIndex(index);
        this.el.replaceChild(cellView.el, cellEl);
        cellView.triggerMethod('before:attach');
        cellView.triggerMethod('attach');
        if (this.getOption('isTree') && index === 0) {
            this.insertFirstCellHtml(true);
        }
        this.__updateValidationErrorForColumn({ column, index });
    },

    __getReadonlyCell(column: Column): string {
        return CellViewFactory.getCell(column, this.model);
    },

    __insertReadonlyCell({ column, index }: { column: Column, index: number }) {
        const cell = this.__getReadonlyCell(column);
        const cellEl = this.__getCellByColumnIndex(index);
        cellEl.outerHTML = cell;
        this.cellViewsByKey[column.key]?.destroy();
        delete this.cellViewsByKey[column.key];
        if (this.getOption('isTree') && index === 0) {
            this.insertFirstCellHtml(true);
        }
        this.__updateValidationErrorForColumn({ column, index });
    },

    __handleSelection() {
        this.el.classList.add(classes.selected);
    },

    __handleDeselection() {
        this.el.classList.remove(classes.selected);
        this.__deselectPointed();
    },

    __toggleCollapse(event: MouseEvent) {
        this.updateCollapsed(this.model);
        if (this.model.collapsed === undefined ? false : !this.model.collapsed) {
            this.model.collapse();
        } else {
            this.model.expand();
        }
        this.trigger('toggle:collapse', this.model);
        event.stopPropagation();
    },

    __onModelChecked() {
        this.internalCheck = true;
        if (this.model.children?.length) {
            this.model.children.forEach((model: GridItemModel) => model.check());
        }
        this.internalCheck = false;
        this.__updateParentChecked();
    },

    __onModelUnchecked() {
        this.internalCheck = true;
        if (this.model.children?.length) {
            this.model.children.forEach((model: GridItemModel) => model.uncheck());
        }
        this.internalCheck = false;
        this.__updateParentChecked();
    },

    __updateParentChecked() {
        if (this.internalCheck) {
            return;
        }
        const parentModel = this.model.parentModel;
        if (parentModel) {
            let checkedChildren = 0;
            parentModel.children.forEach((child: GridItemModel) => {
                if (child.checked) {
                    checkedChildren++;
                }
            });
            if (checkedChildren === 0) {
                parentModel.uncheck();
            } else if (parentModel.children.length === checkedChildren) {
                parentModel.check();
            } else {
                parentModel.checkSome();
            }
        }
    },

    __deselectPointed() {
        if (this.lastPointedEl) {
            this.lastPointedEl.classList.remove(classes.cellFocused);
        }
        if (this.lastPointedIndex > -1) {
            const column = this.options.columns[this.lastPointedIndex];
            this.cellViewsByKey[column.key]?.blur?.();
            this.__insertReadonlyCell({ column, index: this.lastPointedIndex });
            delete this.lastPointedIndex;
        }
        if (this.multiValuePopout) {
            this.multiValuePopout.close();
        }
    },

    __selectPointed(columnIndex: number, isFocusEditor: boolean, isFocusChangeNeeded = true, isErrorButtonClicked = false) {
        let pointedEl = this.__getCellByColumnIndex(columnIndex);
        if (pointedEl == null) {
            return;
        }
        if (this.lastPointedEl && this.lastPointedEl !== pointedEl) {
            this.__deselectPointed();
        }
        const column = this.getOption('columns')[columnIndex];

        if (isFocusEditor && isFocusChangeNeeded && this.lastPointedIndex !== columnIndex && this.__isColumnEditable(columnIndex)) {
            const cell = this.__getEditableCell(column);
            this.__insertEditableCell({ column, index: columnIndex, CellView: cell });
            pointedEl = this.__getCellByColumnIndex(columnIndex); // override pointedEl because of replaceChild
            this.gridEventAggregator.pointedCell = columnIndex;
            this.lastPointedIndex = columnIndex;
            this.cellViewsByKey[column.key]?.focus?.();
        } else if (this.lastPointedIndex > -1 && isFocusChangeNeeded) {
            this.__insertReadonlyCell({ column, index: this.lastPointedIndex });
            pointedEl = this.__getCellByColumnIndex(this.lastPointedIndex);
            delete this.lastPointedIndex;
            pointedEl.focus();
        } else if (this.lastPointedIndex === undefined) {
            pointedEl.focus();
        }
        if (isErrorButtonClicked) {
            this.__showErrorsForColumn({ element: pointedEl, column, index: columnIndex });
        }
        pointedEl.classList.add(classes.cellFocused);
        this.lastPointedEl = pointedEl;
    },

    __someFocused(nodeList: NodeList) {
        const someFunction = (node: Node) => document.activeElement === node || node.contains(document.activeElement);
        return Array.prototype.some.call(nodeList, someFunction);
    },

    __handleEnter(e: KeyboardEvent) {
        this.__selectPointed(this.gridEventAggregator.pointedCell, true, e);
    },

    __handleExit(e: KeyboardEvent) {
        this.__selectPointed(this.gridEventAggregator.pointedCell, false, e);
    },

    __getFocusedColumnIndex(e: MouseEvent): number {
        const elIndex = [...this.el.children].findIndex((cell: Element) => cell.contains(e.target));
        return this.options.showCheckbox ? elIndex - 1 : elIndex;
    },

    __handleModelMouseEnter() {
        this.el.classList.add(classes.hover);
    },

    __handleMouseLeave() {
        this.model.trigger('mouseleave');
    },

    __handleModelMouseLeave() {
        this.el.classList.remove(classes.hover);
    },

    __blink() {
        this.el.classList.add(classes.hover__transition);
        this.el.classList.add(classes.hover);
        setTimeout(() => this.el.classList.remove(classes.hover), config.TRANSITION_DELAY);
        setTimeout(() => this.el.classList.remove(classes.hover__transition), config.TRANSITION_DELAY * 2);
    },

    __setCellHidden({ column, index, isHidden }: { column: Column, index: number, isHidden: boolean }) {
        if (this.cellConfigs[column.key].isHidden === isHidden) {
            return;
        }
        const isTree = this.getOption('isTree');
        this.cellConfigs[column.key].isHidden = isHidden;
        const oldCellView = this.cellViewsByKey[column.key];
        const element = this.__getCellByColumnIndex(index);
        this.__insertReadonlyCell({ column, index });

        if (oldCellView) {
            oldCellView.destroy();
        }
    },

    __renderCell({ column, index, CellView }: { column: Column, index: number, CellView: Marionette.View<any> }) {
        let cellClasses = column.customClass ? `${column.customClass} ` : '';
        if (column.editable) cellClasses += classes.cellEditable;

        const cellView = new CellView({
            className: `${classes.cell} ${column.columnClass} ${cellClasses}`,
            schema: column,
            model: this.model,
            key: column.key
        });

        cellView.el.setAttribute('tabindex', -1);

        cellView.render();
        this.cellViewsByKey[column.key] = cellView;

        return cellView;
    },

    __onValidated() {
        this.__updateValidationErrors({ onValidated: true });
    },

    __updateValidationErrors({ onValidated }: { onValidated?: boolean } = {}) {
        if (!onValidated && !this.model.validationError) {
            return;
        }
        this.options.columns.forEach((column: Column, index: number) => this.__updateValidationErrorForColumn({ column, index }));
    },

    __updateValidationErrorForColumn({ column, index }: { column: Column, index: number }) {
        const errorButton = `<i class="${classes.errorButton} form-label__error-button fa fa-exclamation-circle popout__action-btn"></i>`;
        const addError = (el: Element) => {
            el.classList.add(classes.cellError);
            if (!el.querySelector(`.${classes.errorButton}`)) {
                el.insertAdjacentHTML('beforeend', errorButton);
            }
        };
        const removeError = (el: Element) => {
            el.classList.remove(classes.cellError);
            const errorEl = el.querySelector(`.${classes.errorButton}`);
            if (errorEl) {
                errorEl.parentElement?.removeChild(errorEl);
            }
        };
        const cellEl = this.__getCellByColumnIndex(index);
        if (this.model.validationError?.[column.key]) {
            addError(cellEl);
        } else {
            removeError(cellEl);
        }
    },

    __showErrorsForColumn({ element, column, index }: { element: Element, column: Column, index: number }) {
        if (this.errorShownIndex === index) {
            return;
        }
        const errors = this.model.validationError[column.key];
        this.errorPopout = dropdown.factory.createDropdown({
            buttonView: Marionette.View,
            panelView: ErrorsPanelView,
            panelViewOptions: {
                collection: new Backbone.Collection(errors)
            },
            popoutFlow: 'right',
            element,
            autoOpen: false
        });
        this.errorPopout.open();
        this.errorPopout.on('close', () => delete this.errorShownIndex);
        this.errorShownIndex = index;
    }
});
