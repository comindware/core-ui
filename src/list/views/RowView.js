//@flow
import CellViewFactory from '../CellViewFactory';
import { transliterator } from 'utils';

const config = {
    TRANSITION_DELAY: 400
};

const classes = {
    checked: 'editor_checked',
    checked_some: 'editor_checked_some',
    selected: 'selected',
    dragover: 'dragover',
    hover: 'hover',
    hover__transition: 'hover__transition',
    rowChecked: 'row-checked',
    expanded: 'collapsible-btn_expanded',
    collapsible: 'js-collapsible-button',
    collapsibleIcon: 'js-tree-first-cell',
    cellFocused: 'cell-focused',
    cellEditable: 'cell_editable',
    cell: 'cell'
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
        'click @ui.checkbox': '__handleCheckboxClick',
        click: '__handleClick',
        dblclick: '__handleDblClick',
        'click @ui.collapsibleButton': '__toggleCollapse',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop',
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
        blink: '__blink',
        'toggle:collapse': 'updateCollapsed',
        checked: '__addCheckedClass',
        unchecked: '__removeCheckedClass'
    },

    initialize() {
        _.defaults(this.options, defaultOptions);
        this.gridEventAggregator = this.options.gridEventAggregator;
        this.collection = this.model.collection;
    },

    getValue(id) {
        this.model.get(id);
    },

    onRender() {
        const model = this.model;
        this.listenTo(this.model, 'checked unchecked checked:some', this.__updateState);
        if (model.selected) {
            this.__handleSelection();
            if (this.gridEventAggregator.isEditable && this.gridEventAggregator.pointedCell !== undefined) {
                this.__selectPointed(this.gridEventAggregator.pointedCell);
            }
        }
        if (model.highlighted) {
            this.__handleHighlight(model.highlightedFragment);
        }
        this.__updateState();
    },

    onDestroy() {
        if (this.cellViews) {
            this.cellViews.forEach(x => x.destroy());
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

        const isTree = this.getOption('isTree');
        this.options.columns.forEach((gridColumn, index) => {
            const cell = gridColumn.cellView || CellViewFactory.getCellViewForColumn(gridColumn, this.model); // move to factory

            if (typeof cell === 'string') {
                this.el.insertAdjacentHTML('beforeend', cell);
                return;
            }

            const cellView = new cell({
                className: `${classes.cell} ${gridColumn.customClass ? `${gridColumn.customClass} ` : ''}`,
                schema: gridColumn,
                model: this.model,
                key: gridColumn.key,
                tagName: 'td'
            });

            cellView.el.setAttribute('tabindex', -1); //todo add tabindex by default

            cellView.render();
            this.el.insertAdjacentElement('beforeend', cellView.el);
            cellView.triggerMethod('attach');

            this.cellViewsByKey[gridColumn.key] = cellView;
            this.cellViews.push(cellView);
        });

                if (isTree) {
            const firstCell = this.options.columns[0];

            if (typeof firstCell.cellView === 'string' || !firstCell.editable) {
                this.insertFirstCellHtml();
            } else {
                this.insertFirstCellHtml(true);
            }
        }
    },

    __handleChange() {
        const changed = this.model.changedAttributes();
        if (changed) {
            this.getOption('columns').forEach((column, index) => {
                if (Object.prototype.hasOwnProperty.call(changed, column.key) && !column.cellView && !column.editable) {
                    const element = this.el.querySelector(`.${this.columnClasses[index]}`); //todo WTF
                    if (element) {
                        element.insertAdjacentHTML('afterend', CellViewFactory.getCellHtml(column, this.model));
                        this.el.removeChild(element);
                        if (this.getOption('isTree') && index === 0) {
                            this.insertFirstCellHtml(true);
                        }
                    }
                }
            });
        }
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

    __findInParents(draggingModel, model) {
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
        if ((!this.el.contains(event.relatedTarget) && this.model.collection.dragoverModel !== this.model) || event.relatedTarget.classList.contains('js-grid-content-view')) {
            this.model.trigger('dragleave', event);
            delete this.model.dragover;
        }
    },

    __handleModelDragLeave() {
        this.el.classList.remove(classes.dragover);
    },

    __handleDrop(event) {
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
        this.cellViews.forEach(cellView => {
            cellView.model.set('highlightedFragment', fragment);
        });
    },

    __handleUnhighlight() {
        this.cellViews.forEach(cellView => {
            cellView.model.set('highlightedFragment', null);
        });
    },

    insertFirstCellHtml(force) {
        if (this.isRendered()) {
            const elements = this.el.getElementsByClassName(this.columnClasses[0]);
            if (elements.length) {
                const el = elements[0];
                const level = this.model.level || 0;
                let margin = level * this.options.levelMargin;
                const hasChildren = this.model.children && this.model.children.length;
                const treeFirstCell = el.getElementsByClassName('js-tree-first-cell')[0];
                if (!force && this.lastHasChildren === hasChildren && this.lastMargin === margin) {
                    return;
                }

                if (treeFirstCell) {
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
                            }"></span></div>`
                        );
                    }
                    isContext.style.marginLeft = `${margin + defaultOptions.subGroupMargin}px`;
                } else if (hasChildren) {
                    el.insertAdjacentHTML(
                        'afterbegin',
                        `<span class="js-tree-first-cell collapsible-btn ${classes.collapsible} ${
                            this.model.collapsed === false ? classes.expanded : ''
                        }" style="margin-left:${margin}px;"></span>`
                    );
                } else {
                    el.insertAdjacentHTML('afterbegin', `<span class="js-tree-first-cell" style="margin-left:${margin + defaultOptions.subGroupMargin}px;"></span>`);
                }
                this.lastHasChildren = hasChildren;
                this.lastMargin = margin;
            }
        }
    },

    __insertCellChechbox() {
        this.el.insertAdjacentHTML(
            'afterBegin',
            `
            <td class="cell_selection">
        ${
            this.options.draggable
                ? `
<svg class="cell__dots" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
    x="0px" y="0px" viewBox="0 0 2 35" xml:space="preserve">
    <circle cx="1" cy="12" r="1.2"></circle>
    <circle cx="1" cy="17" r="1.2"></circle>
    <circle cx="1" cy="22" r="1.2"></circle>
</svg>`
                : ''
        }${
                this.options.index
                    ? `
<span class="js-index cell__index">
    {{index}}
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

    __handleCheckboxClick() {
        this.model.toggleChecked();
        if (this.getOption('bindSelection')) {
            this.model.collection.updateTreeNodesCheck(this.model);
        }
    },

    __handleModelClick(e) {
        const model = this.model;

        const selectFn = model.collection.selectSmart || model.collection.select;
        if (selectFn) {
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey, undefined, {
                isModelClick: true
            });
            if (this.gridEventAggregator.isEditable) {
                const cellIndex = this.__getFocusedCellIndex(e);
                if (cellIndex > -1 && this.getOption('columns')[cellIndex].editable) {
                    this.gridEventAggregator.pointedCell = cellIndex;

                    // todo: find more clear way to handle this case
                    const isFocusChangeNeeded = !e.target.classList.contains('js-field-error-button');
                    setTimeout(
                        () => this.__selectPointed(cellIndex, true, isFocusChangeNeeded),
                        11 //need more than debounce delay in selectableBehavior calculateLength
                    );
                }
            }
        }
        this.trigger('click', this.model);
    },

    __handleModelDblClick() {
        this.trigger('dblclick', this.model);
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

    __selectPointed(pointed, isFocusEditor, isFocusChangeNeeded = true) {
        const pointedEl = this.el.querySelector(`.${this.columnClasses[pointed]}`);
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
            if (view && view.editor && view.editor.hidden) {
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

    __getFocusedCellIndex(e) {
        return Array.prototype.findIndex.call(this.el.children, cell => cell.contains(e.target));
    },

    __blink() {
        this.el.classList.add(classes.hover__transition);
        this.el.classList.add(classes.hover);
        setTimeout(() => this.el.classList.remove(classes.hover), config.TRANSITION_DELAY);
        setTimeout(() => this.el.classList.remove(classes.hover__transition), config.TRANSITION_DELAY * 2);
    },

    __addCheckedClass() {
        this.el.classList.add(classes.rowChecked);
    },

    __removeCheckedClass() {
        this.el.classList.remove(classes.rowChecked);
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
                break;
            case 'checkedSome':
                this.ui.checkbox.removeClass(classes.checked);
                this.ui.checkbox.addClass(classes.checked_some);
                break;
            case 'unchecked':
            default:
                this.ui.checkbox.removeClass(classes.checked);
                this.ui.checkbox.removeClass(classes.checked_some);
                break;
        }
    }
});
