import { transliterator } from 'utils';
import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import _ from 'underscore';
import { validationSeverityTypes, validationSeverityClasses } from 'Meta';
import { classes } from '../meta';
import dropdown from 'dropdown';
import MobileService from '../../services/MobileService';
import CellViewFactory from '../CellViewFactory';
import { Column, GridItemModel } from '../types/types';
import { objectPropertyTypes, complexValueTypes, DOUBLECLICK_DELAY } from '../../Meta';
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
        contextmenu: '__handleContextMenu',
        touchend: '__handleTouchEnd',
        touchmove: '__handleTouchMove',
        touchcancel: '__handleTouchCancel'
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
        validated: '__onValidated',
        'set:draggable': '__setDraggable',
        'dragleave': '__onModelDragLeave'
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
        this.__debounceSelectPointedOnClick = _.debounce((...args) => this.__selectPointedOnClick(...args), DOUBLECLICK_DELAY);
        this.__debounceDeselectPointed = _.debounce((...args) => this.__deselectPointed(...args), DOUBLECLICK_DELAY);
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
        this.errorPopout?.destroy();
        this.multiValuePopout?.destroy();
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
                if (this.getOption('showCheckbox')) {
                    const firstChildEl = this.el.firstChild;
                    firstChildEl.insertAdjacentElement('afterend', cellView.el);
                } else {
                    this.el.insertAdjacentElement('afterbegin', cellView.el);
                }
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
        if (index !== this.model.currentIndex) {
            this.el.querySelector('.js-index').innerHTML = index;
            this.model.currentIndex = index;
        }
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
                    `<i class="${classes.collapsible} js-tree-first-cell context-collapsible-btn ${Handlebars.helpers.iconPrefixer('angle-down')} ${this.model.collapsed === false ? classes.expanded : ''}"></i>`
                );
            }
            isContext.style.marginLeft = `${margin + defaultOptions.subGroupMargin}px`;
        } else if (hasChildren) {
            el.insertAdjacentHTML(
                'afterbegin',
                `<i class="js-tree-first-cell collapsible-btn ${classes.collapsible}
                 ${Handlebars.helpers.iconPrefixer('angle-down')} ${this.model.collapsed === false ? classes.expanded : ''}" style="margin-left:${margin}px;"></i/`
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
        if (!this.options.draggable) {
            console.warn('Can not set draggable cause draggable options is false');
            return;
        }
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
            const isShowEditor =  this.__isColumnEditable(columnIndex) || column.isShowEditor;
            if (isShowEditor
             // temporary desicion for complex cells
             || (column.type === 'Complex' && [complexValueTypes.expression, complexValueTypes.script].includes(this.model.get(column.key)?.type))) {

                // change boolean value immediatly
                if (column.type === objectPropertyTypes.BOOLEAN && this.lastPointedIndex !== columnIndex) {
                    const newValue = column.storeArray ? [!this.model.get(column.key)?.[0]] : !this.model.get(column.key);
                    this.model.set(column.key, newValue);
                }

            } else {
                const values = this.model.get(column.key);
                if (values?.length > 1 && this.multiValueShownIndex !== columnIndex)  {
                    this.__showDropDown(columnIndex);
                }
            }
            this.__debounceSelectPointedOnClick({ isErrorButtonClicked, column, columnIndex });
        }

        this.gridEventAggregator.trigger('click', this.model);
    },

    __selectPointedOnClick({ isErrorButtonClicked, column, columnIndex }: { isErrorButtonClicked: boolean, column: Column, columnIndex: number }) {
        if (this.__isDoubleClicked) {
            if (this.lastPointedIndex > -1 && this.lastPointedIndex === columnIndex) {
                this.__deselectPointed();
            }
            this.__isDoubleClicked = false;
            return;
        }
        this.__selectPointed(columnIndex, true);
        if (isErrorButtonClicked) {
            this.__showErrorsForColumn({ column, index: columnIndex });
        }
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
            this.__isDoubleClicked = true;
            this.gridEventAggregator.trigger('row:pointer:down', this.model);
            this.gridEventAggregator.trigger('dblclick', this.model);
        }
    },

    __handleTouchEnd() {
        if (MobileService.isMobile) {
            if (this.isTouchMoveEvent) {
                this.isTouchMoveEvent = false;
                return;
            }
            this.gridEventAggregator.trigger('row:pointer:down', this.model);
        }
    },

    __handleTouchCancel() {
        this.isTouchMoveEvent = false;
    },

    __handleTouchMove() {
        this.isTouchMoveEvent = true;
    },

    __handleSelection() {
        this.el.classList.add(classes.selected);
    },

    __handleDeselection() {
        this.el.classList.remove(classes.selected);
        this.__debounceDeselectPointed();
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
        if (this.lastPointedIndex > -1) {
            const isColumnEditable = this.__isColumnEditable(this.lastPointedIndex);
            if (isColumnEditable) {
                const column = this.getOption('columns')[this.lastPointedIndex];
                this.cellViewsByKey[column.key]?.blur?.();
                this.__insertReadonlyCell({ column, index: this.lastPointedIndex });
            }
            const lastPointedEl = this.__getCellByColumnIndex(this.lastPointedIndex);
            lastPointedEl.classList.remove(classes.cellFocused);
            delete this.lastPointedIndex;
            delete this.lastFocusEditor;
        }
    },

    __selectPointed(columnIndex: number, focusEditor: boolean = this.lastFocusEditor) {
        if (this.lastPointedIndex === columnIndex && this.lastFocusEditor === focusEditor) {
            return;
        }

        if (this.lastPointedIndex > -1 && this.lastPointedIndex !== columnIndex) {
            this.__deselectPointed();
        }

        const isColumnEditable = this.__isColumnEditable(columnIndex);

        if (isColumnEditable) {
            const column = this.getOption('columns')[columnIndex];
            if (focusEditor) {
                const cell = this.__getEditableCell(column);
                this.__insertEditableCell({ column, index: columnIndex, CellView: cell  });
                this.cellViewsByKey[column.key]?.focus?.();
            } else {
                this.__insertReadonlyCell({ column, index: columnIndex })
            }
        }
        
        this.gridEventAggregator.pointedCell = columnIndex;
        const pointedEl = this.__getCellByColumnIndex(columnIndex);
        if (!focusEditor || !isColumnEditable) {
            pointedEl.focus();
        }
        if (this.gridEventAggregator.isEditable) {
            pointedEl.classList.add(classes.cellFocused);
        }
        this.lastPointedIndex = columnIndex;
        this.lastFocusEditor = focusEditor;
    },

    __someFocused(nodeList: NodeList) {
        const someFunction = (node: Node) => document.activeElement === node || node.contains(document.activeElement);
        return Array.prototype.some.call(nodeList, someFunction);
    },

    __handleEnter(e: KeyboardEvent) {
        this.__selectPointed(this.gridEventAggregator.pointedCell, true);
    },

    __handleExit(e: KeyboardEvent) {
        this.__selectPointed(this.gridEventAggregator.pointedCell, false);
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
        // TODO: scrollIntoViewIfNeeded, IE, top?
        if (this.el.getBoundingClientRect().bottom > window.innerHeight) {
            this.el.scrollIntoView(false);
        }
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
                this.el.classList.remove(classes.rowCheckedSome);
                break;
            case 'checkedSome':
                this.ui.checkbox.get(0).innerHTML = '<i class="fas fa-square"></i>';
                this.el.classList.add(classes.rowChecked, classes.rowCheckedSome);
                break;
            case 'unchecked':
            default:
                this.ui.checkbox.get(0).innerHTML = '';
                this.el.classList.remove(classes.rowChecked, classes.rowCheckedSome);
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
        const cellView = new CellView({
            class: `${classes.cell} ${column.customClass || ''} ${column.columnClass || ''} ${this.__getDropdownClass(column)}`,
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

    __getDropdownClass(column: Column): string {
        switch (column.dataType || column.type) {
            case objectPropertyTypes.INSTANCE:
            case objectPropertyTypes.DOCUMENT:
            case objectPropertyTypes.ACCOUNT:
            case objectPropertyTypes.ENUM:
                return classes.dropdownRoot;
            default:
                return '';
        }
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
        const cellEl = this.__getCellByColumnIndex(index);
        const columnError = this.model.validationError?.[column.key];
        if (columnError) {
            const oldErrorButton = cellEl.querySelector(`.${classes.errorButton}`);
            if (oldErrorButton) {
                cellEl.removeChild(oldErrorButton);
            }
            let severityPart;
            if (Array.isArray(columnError) && columnError.every(error => error.severity?.toLowerCase() === validationSeverityTypes.WARNING)) {
                cellEl.classList.add(validationSeverityClasses.WARNING);
                severityPart = validationSeverityClasses.WARNING;
            } else {
                cellEl.classList.add(validationSeverityClasses.ERROR);
                severityPart = validationSeverityClasses.ERROR;
            }
            const errorButton = `<i class="${classes.errorButton} form-label__${severityPart}-button popout__action-btn"></i>`;
            cellEl.insertAdjacentHTML('beforeend', errorButton);
        } else {
            cellEl.classList.remove(validationSeverityClasses.ERROR);
            cellEl.classList.remove(validationSeverityClasses.WARNING);
            const errorEl = cellEl.querySelector(`.${classes.errorButton}`);
            if (errorEl) {
                errorEl.parentElement?.removeChild(errorEl);
            }
        }
    },

    __showErrorsForColumn({ column, index } : { column: Column, index: number }) {
        if (this.errorShownIndex === index) {
            return;
        }

        const element = this.__getCellByColumnIndex(index);
        const errors = this.model.validationError[column.key];
        this.errorCollection ? this.errorCollection.reset(errors) : (this.errorCollection = new Backbone.Collection(errors));
        this.errorPopout = dropdown.factory.createPopout({
            buttonView: Marionette.View,
            buttonModel: new Backbone.Model({ errorCollection: this.errorCollection }),
            panelView: ErrorsPanelView,
            panelViewOptions: {
                collection: this.errorCollection
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
