//@flow
import CellViewFactory from '../CellViewFactory';
import { transliterator } from 'utils';
import Marionette from 'backbone.marionette';
import _ from 'underscore';
import { classes } from '../meta';
import draggableDots from '../templates/draggableDots.html';

const config = {
    TRANSITION_DELAY: 400
};

const defaultOptions = {
    levelMargin: 10,
    contextLevelMargin: 30,
    subGroupMargin: 20,
    draggable: false
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
        'pointerdown @ui.checkbox': '__handleCheckboxClick',
        click: '__handleClick',
        dblclick: '__handleDblClick',
        'pointerdown @ui.collapsibleButton': '__toggleCollapse',
        'click @ui.collapsibleButton': (event: MouseEvent) => event.stopPropagation(),
        dragstart: '__handleDragStart',
        dragend: '__handleDragEnd',
        dragover: '__handleDragOver',
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
        'checked:some': '__updateState'
    },

    initialize() {
        _.defaults(this.options, defaultOptions);
        this.gridEventAggregator = this.options.gridEventAggregator;
        this.listenTo(this.gridEventAggregator, 'set:draggable', this.__updateDraggable);
        this.collection = this.model.collection;
        this.cellConfigs = {};
        this.options.columns.forEach((column, index) => {
            this.cellConfigs[column.key] = { isHidden: false };
            if (typeof column.getHidden === 'function') {
                this.listenTo(this.model, 'change', () => this.__setCellHidden({ column, index, isHidden: Boolean(column.getHidden(this.model)) }));
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
            const firstCell = this.options.columns[0];

            this.insertFirstCellHtml(firstCell.cellView === 'string' || !firstCell.editable);
        }
    },

    onDestroy() {
        if (this.cellViews) {
            this.cellViews.forEach(x => x.destroy());
            this.cellViews = [];
            this.cellViewsByKey = {};
        }
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

    __setCustomClassToColumn(gridColumn) {
        if (gridColumn.isHidden) {
            if (!gridColumn.customClass) {
                gridColumn.customClass = classes.hiddenByTreeEditorClass;
            } else if (!gridColumn.customClass.match(new RegExp(classes.hiddenByTreeEditorClass))) {
                gridColumn.customClass += ` ${classes.hiddenByTreeEditorClass}`;
            }
        } else if (gridColumn.customClass) {
            gridColumn.customClass = gridColumn.customClass.replace(new RegExp(classes.hiddenByTreeEditorClass), '');
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
        if (this.cellViews) {
            this.cellViews.forEach(view => view.destroy());
        }
        this.cellViews = [];
        this.cellViewsByKey = {};

        if (this.getOption('showCheckbox')) {
            this.__insertCellChechbox();
        }

        this.options.columns.forEach((column, index) => {
            this.__setCustomClassToColumn(column);
            let cell;
            if (typeof column.getHidden === 'function' && Boolean(column.getHidden(this.model))) {
                this.cellConfigs[column.key].isHidden = true;
                cell = `<td class="cell ${column.columnClass || ''}"></td>`;
            } else {
                cell = column.cellView || CellViewFactory.getCellViewForColumn(column, this.model); // move to factory
            }

            if (typeof cell === 'string') {
                this.el.insertAdjacentHTML('beforeend', cell);
                return;
            }
            if (typeof cell === 'object') {
                this.el.insertAdjacentElement('beforeend', cell);
                return;
            }

            const cellView = this.__renderCell({ column, index, CellView: cell });
            cellView.el.setAttribute('tabindex', -1);

            this.el.insertAdjacentElement('beforeend', cellView.el);
            cellView.triggerMethod('before:attach');
            cellView.triggerMethod('attach');
        });
    },

    __handleChange() {
        const changed = this.model.changedAttributes();
        if (changed) {
            this.getOption('columns').forEach((column, index) => {
                if (Object.prototype.hasOwnProperty.call(changed, column.key) && !column.cellView && !column.editable) {
                    const element = this.el.getElementsByTagName('td')[index + 1];
                    if (element) {
                        const cell = CellViewFactory.getCell(column, this.model);

                        if (typeof cell === 'string') {
                            element.insertAdjacentHTML('afterend', cell);
                        } else {
                            element.insertAdjacentElement('afterend', cell);
                        }

                        this.el.removeChild(element);
                        if (this.getOption('isTree') && index === 0) {
                            this.insertFirstCellHtml(true);
                        }
                    }
                }
            });
        }
    },

    __handleDragStart(event) {
        this.collection.draggingModel = this.model;
        event.originalEvent.dataTransfer.setData('Text', this.cid); // fix for FireFox
    },

    __handleDragEnd() {
        this.__handleDragLeave();
        delete this.collection.draggingModel;
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

    __findInParents(draggingModel, model): boolean {
        if (model === draggingModel) {
            return true;
        }
        if (model.parentModel) {
            return this.__findInParents(draggingModel, model.parentModel);
        }
        return false;
    },

    __handleDragOver(event: MouseEvent) {
        // prevent default to allow drop
        event.preventDefault();
    },

    __handleDragEnter(event: MouseEvent) {
        if (this.__allowDrop()) {
            this.el.classList.add(classes.dragover);
        }
    },

    __handleDragLeave(event: MouseEvent) {
        if (this.__allowDrop()) {
            this.el.classList.remove(classes.dragover);
        }
    },

    __handleDrop(event: MouseEvent) {
        event.preventDefault();
        if (this.__allowDrop()) {
            this.el.classList.remove(classes.dragover);

            this.gridEventAggregator.trigger('drag:drop', this.model.collection.draggingModel, this.model);
            delete this.collection.draggingModel;
        }
    },

    __handleContextMenu(event: MouseEvent) {
        this.model.trigger('contextmenu', event);
    },

    __handleHighlight(fragment) {
        this.cellViews.forEach(cellView => {
            cellView.model.set('highlightedFragment', fragment);
        });
    },

    __handleUnhighlight() {
        this.cellViews.forEach(cellView => {
            cellView.model.set('highlightedFragment', null);
        });
    },

    updateIndex(index: number) {
        this.el.querySelector('.js-index').innerHTML = index;
        this.model.currentIndex = index;
    },

    insertFirstCellHtml(force: boolean) {
        const elements = this.el.getElementsByTagName('td');
        if (elements.length) {
            const level = this.model.level || 0;
            let margin = level * this.options.levelMargin;
            const hasChildren = this.model.children && this.model.children.length;
            if (!force && this.lastHasChildren === hasChildren && this.lastMargin === margin) {
                return;
            }

            const index = this.getOption('showCheckbox') ? 1 : 0;
            const el = elements[index];
            const treeFirstCell = el.getElementsByClassName('js-tree-first-cell')[0];

            if (treeFirstCell && treeFirstCell.parentElement === el) {
                el.removeChild(treeFirstCell);
            }

            const isContext = el.getElementsByClassName('context-icon')[0];
            if (isContext) {
                margin = level * this.options.contextLevelMargin;
                if (hasChildren) {
                    el.insertAdjacentHTML(
                        'beforeend',
                        `<div class="${classes.collapsible} context-collapse-button"><span class="js-tree-first-cell context-collapsible-btn ${
                            this.model.collapsed === false ? classes.expanded : ''
                        }"><svg viewBox="0 0 12 12"><polygon class="d-svg-icons d-svg-icons_arrow" points="8,2 4.5,5.5 1,2 0,2 0,3 4,7 5,7 9,3 9,2 "/></svg></span></div>`
                    );
                }
                isContext.style.marginLeft = `${margin + defaultOptions.subGroupMargin}px`;
            } else if (hasChildren) {
                el.insertAdjacentHTML(
                    'afterbegin',
                    `<span class="js-tree-first-cell collapsible-btn ${classes.collapsible} ${
                        this.model.collapsed === false ? classes.expanded : ''
                    }" style="margin-left:${margin}px;"><svg viewBox="0 0 12 12"><polygon class="d-svg-icons d-svg-icons_arrow" points="8,2 4.5,5.5 1,2 0,2 0,3 4,7 5,7 9,3 9,2 "/></svg></span>`
                );
                const editor = el.getElementsByClassName('editor')[0];
                if (editor) {
                    editor.style.left = `${margin + defaultOptions.subGroupMargin}px`;
                }
            } else {
                el.insertAdjacentHTML('afterbegin', `<span class="js-tree-first-cell" style="margin-left:${margin + defaultOptions.subGroupMargin}px;"></span>`);
            }
            this.lastHasChildren = hasChildren;
            this.lastMargin = margin;
        }
    },

    __insertCellChechbox() {
        this.el.insertAdjacentHTML(
            'afterBegin',
            `
            <td class="${classes.checkboxCell} ${this.options.showRowIndex ? 'cell_selection-index' : 'cell_selection'}"
             ${this.options.draggable ? 'draggable="true"' : ''}>
        ${this.options.draggable ? draggableDots : ''}${
                this.options.showRowIndex
                    ? `
<span class="js-index cell__index">
    ${this.model.collection.indexOf(this.model) + 1}
</span>`
                    : ''
            }
<div class="checkbox js-checkbox">
    <svg class="svg-icons-wrp_checked svg-icons svg-icons_checked">
        <use xlink:href="#icon-checked" />
    </svg>
</div>
</td>
        `
        );
    },

    __updateDraggable(draggable: boolean): void {
        const checkboxCellEl = this.el.querySelector(`.${classes.checkboxCell}`);
        if (!checkboxCellEl) {
            return;
        }
        const hasDraggableAttribute = checkboxCellEl.hasAttribute('draggable');
        if (draggable && !hasDraggableAttribute) {
            checkboxCellEl.setAttribute('draggable', true);
            checkboxCellEl.insertAdjacentHTML('afterbegin', draggableDots);
        } else if (hasDraggableAttribute) {
            checkboxCellEl.removeAttribute('draggable');
            checkboxCellEl.removeChild(checkboxCellEl.firstElementChild);
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
        if (selectFn) {
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey, undefined, {
                isModelClick: true
            });
            if (this.gridEventAggregator.isEditable) {
                const columnIndex = this.__getFocusedColumnIndex(e);

                if (this.__isColumnEditable(columnIndex)) {
                    this.gridEventAggregator.pointedCell = columnIndex;

                    // todo: find more clear way to handle this case
                    const target = <Element>e.target;
                    const isFocusChangeNeeded = target && !target.classList.contains('js-field-error-button');
                    setTimeout(
                        () => this.__selectPointed(columnIndex, true, isFocusChangeNeeded),
                        11 //need more than debounce delay in selectableBehavior calculateLength
                    );
                }
            }
        }
        this.gridEventAggregator.trigger('click', this.model);
    },

    __isColumnEditable(columnIndex: number): boolean {
        return columnIndex > -1 && this.getOption('columns')[columnIndex].editable;
    },

    __handleDblClick() {
        if (!Core.services.MobileService.isMobile) {
            this.gridEventAggregator.trigger('row:pointer:down', this.model);
            this.gridEventAggregator.trigger('dblclick', this.model);
        }
    },

    __handlePointerDown() {
        if (Core.services.MobileService.isMobile) {
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

    __toggleCollapse() {
        this.updateCollapsed(this.model);
        if (this.model.collapsed === undefined ? false : !this.model.collapsed) {
            this.model.collapse();
        } else {
            this.model.expand();
        }
        this.trigger('toggle:collapse', this.model);
        return false;
    },

    __onModelChecked() {
        this.internalCheck = true;
        if (this.model.children && this.model.children.length) {
            this.model.children.forEach(model => {
                model.check();
            });
        }
        this.internalCheck = false;
        this.__updateParentChecked();
    },

    __onModelUnchecked() {
        this.internalCheck = true;
        if (this.model.children && this.model.children.length) {
            this.model.children.forEach(model => {
                model.uncheck();
            });
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
            parentModel.children.forEach(child => {
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
            const lastEditor = this.lastPointedEl.querySelector('input') || this.lastPointedEl.querySelector('[class~=editor]');
            if (lastEditor && lastEditor === document.activeElement) {
                lastEditor.blur();
            }
            this.lastPointedEl.classList.remove(classes.cellFocused);
        }
    },

    __selectPointed(columnIndex: number, isFocusEditor: boolean, isFocusChangeNeeded = true) {
        const pointed = this.getOption('showCheckbox') ? columnIndex + 1 : columnIndex;
        const pointedEl = this.el.getElementsByTagName('td')[pointed];
        if (pointedEl == null) return;

        if (this.lastPointedEl && this.lastPointedEl !== pointedEl) {
            this.__deselectPointed();
        }

        const editors = pointedEl.querySelectorAll('input,[class~=editor]');
        const input = pointedEl.querySelector('input');

        const doesContains = pointedEl.contains(editors[0]);
        const editorNeedFocus = doesContains && isFocusEditor;

        if (editors.length) {
            const view = this.cellViews[pointed];
            if (view?.getHidden?.()) {
                view.model.trigger('select:hidden');
                return false;
            }
            if (editorNeedFocus && !this.__someFocused(editors) && isFocusChangeNeeded) {
                if (input) {
                    if (input.classList.contains('input_duration')) {
                        setTimeout(() => input.focus(), 0);
                    } else {
                        input.focus();
                    }
                } else {
                    editors[0].focus();
                }
            }
        }

        if (!editorNeedFocus && isFocusChangeNeeded) {
            pointedEl.focus();
        }

        pointedEl.classList.add(classes.cellFocused);
        this.lastPointedEl = pointedEl;
    },

    __someFocused(nodeList) {
        const someFunction = node => document.activeElement === node || node.contains(document.activeElement);
        return Array.prototype.some.call(nodeList, someFunction);
    },

    __handleEnter(e) {
        this.__selectPointed(this.gridEventAggregator.pointedCell, true, e);
    },

    __handleExit(e) {
        this.__selectPointed(this.gridEventAggregator.pointedCell, false, e);
    },

    __getFocusedColumnIndex(e: MouseEvent): number {
        const elIndex = Array.prototype.findIndex.call(this.el.children, cell => cell.contains(e.target));
        return this.options.showCheckbox ? elIndex - 1 : elIndex;
    },

    __blink() {
        this.el.classList.add(classes.hover__transition);
        this.el.classList.add(classes.hover);
        setTimeout(() => this.el.classList.remove(classes.hover), config.TRANSITION_DELAY);
        setTimeout(() => this.el.classList.remove(classes.hover__transition), config.TRANSITION_DELAY * 2);
    },

    __updateState(model, checkedState) {
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
                this.ui.checkbox.addClass(classes.checked);
                this.ui.checkbox.removeClass(classes.checked_some);

                this.el.classList.add(classes.rowChecked);
                break;
            case 'checkedSome':
                this.ui.checkbox.removeClass(classes.checked);
                this.ui.checkbox.addClass(classes.checked_some);

                this.el.classList.add(classes.rowChecked);
                break;
            case 'unchecked':
            default:
                this.ui.checkbox.removeClass(classes.checked);
                this.ui.checkbox.removeClass(classes.checked_some);

                this.el.classList.remove(classes.rowChecked);
                break;
        }
    },
    
    __setCellHidden({ column, index, isHidden }) {
        if (this.cellConfigs[column.key].isHidden === isHidden) {
            return;
        }
        const isTree = this.getOption('isTree');
        this.cellConfigs[column.key].isHidden = isHidden;
        const oldCellView = this.cellViewsByKey[column.key];
        const elementIndex = this.options.showCheckbox ? index - 1 : index;
        const element = [...this.el.children][elementIndex];
        if (isHidden) {
            element.outerHTML = `<td class="${classes.cell}"></td>`;
        } else {
            const cell = column.cellView || CellViewFactory.getCellViewForColumn(column, this.model);
            if (typeof cell === 'string') {
                element.outerHTML = cell;    
            } else if (cell instanceof Element) {
                this.el.replaceChild(cell, element);
            } else {
                const cellView = this.__renderCell({ column, index, CellView: cell });
                this.el.replaceChild(cellView.el, element);
                cellView.triggerMethod('before:attach');
                cellView.triggerMethod('attach');
            }
        }        
        if (isTree && index === 0) {
            this.insertFirstCellHtml();
        }  
        if (oldCellView) {
            oldCellView.destroy();
        }
    },

    __renderCell({ column, index, CellView }) {
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
        if (isTree && index === 0) {
            cellView.on('render', () => this.insertFirstCellHtml(true));
        }
        this.cellViewsByKey[column.key] = cellView;
        this.cellViews.push(cellView);

        return cellView;
    }
});
