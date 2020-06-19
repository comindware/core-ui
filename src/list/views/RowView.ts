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
    tagName: 'tr',

    ui: {
        cells: '.js-grid-cell',
        collapsibleButton: '.js-collapsible-button',
        checkbox: '.js-checkbox',
        dots: '.js-dots',
        index: '.js-index'
    },

    events: {
        'click @ui.collapsibleButton': '__toggleCollapse',
        'pointerdown @ui.checkbox': '__handleCheckboxClick',
        click: '__handleClick',
        dblclick: '__handleDblClick',
        dragstart: '__handleDragStart',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop',
        pointerup: '__handlePointerDown',
        contextmenu: '__handleContextMenu'
    },

    modelEvents: {
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        'select:pointed': '__selectPointed',
        'selected:enter': '__handleEnter',
        'selected:exit': '__handleExit',
        highlighted: '__handleHighlight',
        unhighlighted: '__handleUnhighlight',
        change: '__handleChange',
        blink: '__blink',
        'toggle:collapse': 'updateCollapsed',
        checked: '__updateState',
        unchecked: '__updateState',
        'checked:some': '__updateState',
        'set:draggable': '__setDraggable',
    },

    initialize() {
        _.defaults(this.options, defaultOptions);
        this.gridEventAggregator = this.options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'set:draggable', this.__setDraggable);
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

    getValue(id: string) {
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
        if (this.model.checked !== undefined) {
            this.__updateState();
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

    updateCollapsed(model: ListItemModel) {
        const collaspibleButtons = this.el.getElementsByClassName(classes.collapsibleIcon);
        if (!model.collapsed) {
            if (collaspibleButtons.length) {
                collaspibleButtons[0].classList.add(classes.expanded);
            }
        } else if (collaspibleButtons.length) {
            collaspibleButtons[0].classList.remove(classes.expanded);
        }
    },

    __setCustomClassToColumn(column: Column) {
        if (column.isHidden) {
            if (!column.customClass) {
                column.customClass = classes.hiddenByTreeEditorClass;
            } else if (!column.customClass.match(new RegExp(classes.hiddenByTreeEditorClass))) {
                column.customClass += ` ${classes.hiddenByTreeEditorClass}`;
            }
        } else if (column.customClass) {
            column.customClass = column.customClass.replace(new RegExp(classes.hiddenByTreeEditorClass), '');
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

        const itemsHTML: Array<string> = this.itemsHTML = [];
        if (this.getOption('showCheckbox')) {
            this.__insertCellChechbox();
        }

        const customCells: Array<{ index: number, CellView: Marionette.View<Backbone.Model> }> = [];
        this.options.columns.forEach((column: Column, index: number) => {
            this.__setCustomClassToColumn(column);
            if (column.cellView) {
                customCells.push({ index, CellView: column.cellView })
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
            cellView.triggerMethod('before:attach');
            cellView.triggerMethod('attach');
        })
    },

    __handleChange() {
        const changed = this.model.changedAttributes();
        if (!changed) {
            return;
        }
        this.getOption('columns').forEach((column, index) => {
            if (!this.__isNeedToReplaceCell({ changed, column, index })) {
                return;
            }
            this.__insertReadonlyCell({ column, index, isReplace: true });
        });
    },

    __isNeedToReplaceCell({ changed, column, index }) {
        if (column.cellView || column.getHidden?.(this.model)) {
            return false;
        }

        const isCellValueChanged = Object.prototype.hasOwnProperty.call(changed, column.key);
        if (!isCellValueChanged) {
            return false;
        }

        return this.lastPointedIndex !== index;
    },

    __hasCellErrors(column: Column) {
        return column.required && _.isEmpty(this.model.get(column.key));
    },

    __isDropAllowed(): boolean {
        const draggingModels = this.collection.draggingModels;
        if (!draggingModels) {
            return false;
        }
        if (draggingModels.some(draggingModel => this.collection.indexOf(this.model) + 1 === this.collection.indexOf(draggingModel) && this.model.level <= draggingModel.level)) {
            return false;
        }
        if (draggingModels.some(draggingModel => this.__findInParents(draggingModel, this.model))) {
            return false;
        }
        return true;
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

    __handleDragStart(event: { originalEvent: DragEvent }) {
        const checkedModels = this.model.collection.getCheckedModels();

        if (checkedModels.length) {
            return;
        }

        this.model.collection.draggingModels = [this.model];

        const originalEvent = event.originalEvent;
        if (!originalEvent.dataTransfer) {
            return;
        }

        originalEvent.dataTransfer.setData('Text', this.cid); // fix for FireFox
    },

    __handleDragEnter(event: DragEvent) {
        this.__setDragEnterModel(this.model);
    },

    __setDragEnterModel(model: Backbone.Model) {
        const previousDragEnterModel = this.model.collection.dragoverModel;
        if (previousDragEnterModel === model) {
            return;
        }

        previousDragEnterModel?.trigger('dragleave');
        this.model.collection.dragoverModel = model;

        if (this.__isDropAllowed()) {
            this.el.classList.add(classes.dragover);
        }
    },

    __handleDragLeave() {
        this.el.classList.remove(classes.dragover);
    },

    __handleDrop(event: DragEvent) {
        event.preventDefault();
        this.el.classList.remove(classes.dragover);
        if (this.__isDropAllowed()) {
            this.gridEventAggregator.trigger('drag:drop', this.model.collection.draggingModels, this.model);
        }
        delete this.collection.draggingModels;
    },

    __handleContextMenu(event: MouseEvent) {
        this.model.trigger('contextmenu', event);
    },

    __handleHighlight(fragment: string) {
        this.model.set('highlightedFragment', fragment);
    },

    __handleUnhighlight() {
        this.model.set('highlightedFragment', null);
    },

    updateIndex(index: number) {
        this.el.querySelector('.js-index').innerHTML = index;
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

    __insertCellChechbox() {
        if (typeof this.model.__draggable !== 'boolean') {
            this.model.__draggable = this.model.collection.__allDraggable;
        }
        const isDraggable = this.options.draggable && this.model.__draggable;

        if (this.options.showRowIndex) {
            this.model.currentIndex = this.model.collection.indexOf(this.model) + 1;
        }
        const cellHTML =
            `<td class="${classes.checkboxCell} ${this.options.showRowIndex ? 'cell_selection-index' : 'cell_selection'}"
             ${isDraggable ? 'draggable="true"' : ''}>
                ${this.options.showRowIndex
                    ? `<span class="js-index cell__index">
                            ${this.model.currentIndex}
                        </span>`
                    : ''
                }
                    <div class="checkbox js-checkbox"></div>
            </td>`
        this.itemsHTML.push(cellHTML);
    },

    __setDraggable(draggable: boolean): void {
        this.model.__draggable = draggable;

        const checkboxCellEl = this.el.querySelector(`.${classes.checkboxCell}`);
        if (!checkboxCellEl) {
            return;
        }
        const hasDraggableAttribute = checkboxCellEl.hasAttribute('draggable');

        const needSet = draggable && !hasDraggableAttribute;
        const needRemove = !draggable && hasDraggableAttribute;

        if (needSet) {
            checkboxCellEl.setAttribute('draggable', true);
        } else if (needRemove) {
            checkboxCellEl.removeAttribute('draggable');
        }
    },

    __handleCheckboxClick(e: PointerEvent) {
        const isShiftKeyPressed = e.shiftKey;
        if (isShiftKeyPressed) {
            e.preventDefault(); //remove text highlighting from table
        }
        this.model.toggleChecked(isShiftKeyPressed);

        if (this.getOption('bindSelection')) {
            this.model.collection.updateTreeNodesCheck(this.model, undefined, e.shiftKey);
        }
    },

    __handleClick(e: MouseEvent) {
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
            const target = <Element>e.target;
            const isErrorButtonClicked = target && target.classList.contains('js-error-button');
            const isFocusChangeNeeded = columnIndex !== this.lastPointedIndex && target && !isErrorButtonClicked;
            let isFocusEditor: boolean;
            if (this.__isColumnEditable(columnIndex)
             // temporary desicion for complex cells
             || (column.type === 'Complex' && [complexValueTypes.expression, complexValueTypes.script].includes(this.model.get(column.key)?.type))) {

                // change boolean value immediatly
                if (column.type === objectPropertyTypes.BOOLEAN && isFocusChangeNeeded) {
                    const newValue = column.storeArray ? [!this.model.get(column.key)?.[0]] : !this.model.get(column.key);
                    this.model.set(column.key, newValue);
                }
                isFocusEditor = true;
            } else {
                const values = this.model.get(column.key);
                if (values?.length > 1 && this.multiValueShownIndex !== columnIndex)  {
                    this.__showDropDown(columnIndex);
                }
                isFocusEditor = false;
            }
            setTimeout(
                () => this.__selectPointed(columnIndex, isFocusEditor, isFocusChangeNeeded, isErrorButtonClicked),
                11 //need more than debounce delay in selectableBehavior calculateLength
            );
        }

        this.gridEventAggregator.trigger('click', this.model);
    },

    __showDropDown(index: number) {
        const column = this.options.columns[index];
        this.lastShowDropodwnIndex =
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
        return CellViewFactory.getCellViewForColumn(column, this.model)
    },

    __isColumnEditable(columnIndex: number): boolean {
        if (columnIndex < 0 || !this.gridEventAggregator.isEditable)  {
            return false;
        }
        const column = this.getOption('columns')[columnIndex];
        return column.editable && !column.cellView && (!column.getReadonly || !column.getReadonly(this.model)) && (!column.getHidden || !column.getHidden(this.model));
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

    __getReadonlyCell(column: Column): string{
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

    __handleDblClick() {
        if (!MobileService.isMobile) {
            this.gridEventAggregator.trigger('row:pointer:down', this.model);
            this.gridEventAggregator.trigger('dblclick', this.model);
        }
    },

    __handlePointerDown() {
        if (MobileService.isMobile) {
            this.gridEventAggregator.trigger('row:pointer:down', this.model);
        }
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
            this.__insertReadonlyCell({ column, index: this.lastPointedIndex })
            delete this.lastPointedIndex;
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
            this.__insertEditableCell({ column, index: columnIndex, CellView: cell  });
            pointedEl = this.__getCellByColumnIndex(columnIndex); // override pointedEl because of replaceChild
            this.gridEventAggregator.pointedCell = columnIndex;
            this.lastPointedIndex = columnIndex;
            this.cellViewsByKey[column.key]?.focus?.();
        } else if (this.lastPointedIndex > -1 && isFocusChangeNeeded) {
            const column = this.options.columns[this.lastPointedIndex];
            this.__insertReadonlyCell({ column, index: this.lastPointedIndex })
            pointedEl = this.__getCellByColumnIndex(this.lastPointedIndex);
            delete this.lastPointedIndex;
            pointedEl.focus();
        } else if (this.lastPointedIndex === undefined) {
            pointedEl.focus();
        }
        if (isErrorButtonClicked) {
            this.__showErrorsForColumn({ element: pointedEl, column, index: columnIndex });
        }
        if (isFocusEditor) {
            pointedEl.classList.add(classes.cellFocused);
        }
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
        const elIndex = [...this.el.children].findIndex((cell: Element) => cell.contains(<Node>e.target));
        return this.options.showCheckbox ? elIndex - 1 : elIndex;
    },

    __blink() {
        this.el.classList.add(classes.hover__transition);
        this.el.classList.add(classes.hover);
        setTimeout(() => this.el.classList.remove(classes.hover), config.TRANSITION_DELAY);
        setTimeout(() => this.el.classList.remove(classes.hover__transition), config.TRANSITION_DELAY * 2);
    },

    __updateState(model: GridItemModel, checkedState: 'checked' | 'unchecked' | 'checkedSome' | null) {
        let state = checkedState;

        if (!state) {
            if (this.model.checked) {
                state = 'checked';
            } else if (this.model.checked === null) {
                state = 'checkedSome';
            }
        }
        switch (state) {
            case 'checked':
                this.ui.checkbox.get(0).innerHTML = '<i class="fas fa-check"></i>';
                this.el.classList.add(classes.rowChecked);
                break;
            case 'checkedSome':
                this.ui.checkbox.get(0).innerHTML = '<i class="fas fa-square"></i>';
                this.el.classList.add(classes.rowChecked);
                break;
            case 'unchecked':
            default:
                this.ui.checkbox.get(0).innerHTML = '';
                this.el.classList.remove(classes.rowChecked);
                break;
        }
    },

    __setCellHidden({ column, index, isHidden } : { column: Column, index: number, isHidden: boolean }) {
        if (this.cellConfigs[column.key].isHidden === isHidden) {
            return;
        }
        const isTree = this.getOption('isTree');
        this.cellConfigs[column.key].isHidden = isHidden;
        const oldCellView = this.cellViewsByKey[column.key];
        this.__insertReadonlyCell({ column, index });

        if (oldCellView) {
            oldCellView.destroy();
        }
    },

    __renderCell({ column, index, CellView }: { column: Column, index: number, CellView: Marionette.View<any> }) {
        const isTree = this.getOption('isTree');

        const cellView = new CellView({
            class: `${classes.cell} ${column.customClass || ''}`,
            tagName: 'td',
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
        this.__updateValidationErrors({ onValidated: true});
    },

    __updateValidationErrors({ onValidated } : { onValidated?: boolean } = {}) {
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
            el.querySelector(`.${classes.errorButton}`)?.remove();
        };
        const cellEl = this.__getCellByColumnIndex(index);
        if (this.model.validationError?.[column.key]) {
            addError(cellEl);
        } else {
            removeError(cellEl);
        }
    },

    __showErrorsForColumn({ element, column, index } : { element: Element, column: Column, index: number }) {
        if (this.errorShownIndex === index) {
            return;
        }
        const errors = this.model.validationError[column.key];
        this.errorPopout = dropdown.factory.createPopout({
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
