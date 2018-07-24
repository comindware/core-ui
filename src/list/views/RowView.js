//@flow
import CellViewFactory from '../CellViewFactory';

const classes = {
    selected: 'selected',
    expanded: 'collapsible-btn_expanded',
    collapsible: 'js-collapsible-button',
    dragover: 'dragover',
    hover: 'hover',
    cellFocused: 'cell-focused',
    cellEditable: 'cell_editable'
};

const defaultOptions = {
    levelMargin: 10,
    collapsibleButtonWidth: 20
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
        highlighted: '__handleHighlight',
        unhighlighted: '__handleUnhighlight',
        change: '__handleChange',
        dragover: '__handleModelDragOver',
        dragleave: '__handleModelDragLeave',
        drop: '__handleModelDrop',
        mouseenter: '__handleModelMouseEnter',
        mouseleave: '__handleModelMouseLeave',
        'toggle:collapse': 'updateCollapsed'
    },

    initialize() {
        _.defaults(this.options, defaultOptions);
        this.gridEventAggregator = this.options.gridEventAggregator;
        this.columnClasses = this.options.columnClasses;

        // TODO: think about implementation in tree or grouped grids
        // this.listenTo(this.model, 'checked', this.__onModelChecked);
        // this.listenTo(this.model, 'unchecked', this.__onModelUnchecked);
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
    },

    onDestroy() {
        if (this.cellViews) {
            this.cellViews.forEach(x => x.destroy());
        }
    },

    updateCollapsed(model) {
        const collaspibleButtons = this.el.getElementsByClassName(classes.collapsible);
        if (!model.collapsed) {
            if (collaspibleButtons.length) {
                collaspibleButtons[0].classList.add(classes.expanded);
            }
        } else if (collaspibleButtons.length) {
            collaspibleButtons[0].classList.remove(classes.expanded);
        }
    },

    _renderTemplate() {
        if (this.cellViews) {
            this.cellViews.forEach(view => view.destroy());
        }
        this.cellViews = [];

        this.options.columns.forEach(gridColumn => {
            const cell = gridColumn.cellView || CellViewFactory.getCellViewForColumn(gridColumn, this.model); // move to factory

            if (typeof cell === 'string') {
                return this.el.insertAdjacentHTML('beforeend', cell);
            }
            let cellClasses = '';
            if (gridColumn.editable) cellClasses += classes.cellEditable;

            const cellView = new cell({
                className: `cell ${gridColumn.columnClass} ${cellClasses}`,
                schema: gridColumn,
                model: this.model,
                key: gridColumn.key
            });
            cellView.render();
            this.el.insertAdjacentElement('beforeend', cellView.el);
            cellView.triggerMethod('attach');

            this.cellViews.push(cellView);
        });
        if (this.getOption('isTree')) {
            this.insertFirstCellHtml();
        }
    },

    __handleChange() {
        const changed = this.model.changedAttributes();
        if (changed) {
            this.getOption('columns').forEach((column, index) => {
                if (Object.prototype.hasOwnProperty.call(changed, column.key) && !column.cellView && !column.editable) {
                    const elements = this.el.getElementsByClassName(this.columnClasses[index]);
                    if (elements.length) {
                        elements[0].innerHTML = CellViewFactory.getCellHtml(column, this.model);
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
        if (!this.model.collection.draggingModel) {
            return;
        }
        this.model.collection.dragoverModel = this.model;
        if (this.model.collection.draggingModel !== this.model && !this.__findInParents(this.model.collection.draggingModel, this.model)) {
            this.model.trigger('dragover', event);
        }
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
        if (!this.el.contains(event.relatedTarget) && this.model.collection.dragoverModel !== this.model) {
            this.model.trigger('dragleave', event);
            delete this.model.dragover;
        }
    },

    __handleModelDragLeave() {
        this.el.classList.remove(classes.dragover);
    },

    __handleDrop(event) {
        this.model.trigger('drop', event);
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

    insertFirstCellHtml() {
        if (this.isRendered()) {
            const elements = this.el.getElementsByClassName(this.columnClasses[0]);
            if (elements.length) {
                const el = elements[0];
                const level = this.model.level || 0;
                const margin = level * this.options.levelMargin;
                const hasChildren = this.model.children && this.model.children.length;
                const treeFirstCell = el.getElementsByClassName('js-tree-first-cell')[0];
                if (this.lastHasChildren === hasChildren && this.lastMargin === margin) {
                    return;
                }

                if (treeFirstCell) {
                    el.removeChild(treeFirstCell);
                }
                if (hasChildren) {
                    el.insertAdjacentHTML(
                        'afterbegin',
                        `<span class="js-tree-first-cell collapsible-btn ${classes.collapsible} ${
                            this.model.collapsed === false ? classes.expanded : ''
                        }" style="margin-left:${margin}px;"></span>&nbsp;`
                    );
                } else {
                    el.insertAdjacentHTML('afterbegin', `<span class="js-tree-first-cell" style="margin-left:${margin + defaultOptions.collapsibleButtonWidth}px;"></span>`);
                }
                this.lastHasChildren = hasChildren;
                this.lastMargin = margin;
            }
        }
    },

    __handleModelClick(e) {
        const model = this.model;

        if (model.selected) {
            model.deselect();
            this.trigger('click', this.model);
            return;
        }

        const selectFn = model.collection.selectSmart || model.collection.select;
        if (selectFn) {
            if (this.gridEventAggregator.isEditable) {
                const cellIndex = this.__getFocusedCellIndex(e);
                if (cellIndex > -1) {
                    this.gridEventAggregator.pointedCell = cellIndex;
                    this.__selectPointed(cellIndex);
                }
            }
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey);
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
        if (this.lastPointedEl) {
            this.lastPointedEl.classList.remove(classes.cellFocused);
        }
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

    __selectPointed(pointed) {
        if (this.lastPointedEl) {
            this.lastPointedEl.classList.remove(classes.cellFocused);
        }
        const pointedEls = this.el.getElementsByClassName(this.columnClasses[pointed]);
        if (pointedEls && pointedEls.length) {
            const pointedEl = pointedEls[0];
            pointedEl.classList.add(classes.cellFocused);
            const editor = pointedEl.querySelector('input') || pointedEl.querySelector('[class~=editor]');
            if (editor && !pointedEl.contains(document.activeElement)) {
                editor.focus();
            }
            this.lastPointedEl = pointedEl;
        }
    },

    __getFocusedCellIndex(e) {
        let current = e.target;
        let result = -1;
        let parent = current.parentElement;
        while (current && parent && parent !== this.el) {
            const index = this.columnClasses.findIndex(className => parent.className.includes(className));
            if (index > -1 && this.getOption('columns')[index].editable) {
                result = index;
            }
            current = parent;
            parent = current.parentElement;
        }
        return result;
    },

    __handleMouseEnter() {
        this.model.trigger('mouseenter');
    },

    __handleModelMouseEnter() {
        this.el.classList.add(classes.hover);
    },

    __handleMouseLeave() {
        this.model.trigger('mouseleave');
    },

    __handleModelMouseLeave() {
        this.el.classList.remove(classes.hover);
    }
});
