//@flow
import CellViewFactory from '../CellViewFactory';
import transliterator from 'utils/transliterator';

const classes = {
    selected: 'selected',
    expanded: 'collapsible-btn_expanded',
    collapsible: 'js-collapsible-button',
    collapsibleIcon: 'js-tree-first-cell',
    dragover: 'dragover',
    hover: 'hover',
    cellFocused: 'cell-focused',
    cellEditable: 'cell_editable'
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
        this.collection = this.model.collection;

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
                transliteratedFields: this.options.transliteratedFields
            });
        }
        if (this.cellViews) {
            this.cellViews.forEach(view => view.destroy());
        }
        this.cellViews = [];

        const isTree = this.getOption('isTree');
        this.options.columns.forEach((gridColumn, index) => {
            const cell = gridColumn.cellView || CellViewFactory.getCellViewForColumn(gridColumn, this.model); // move to factory

            if (typeof cell === 'string') {
                this.el.insertAdjacentHTML('beforeend', cell);
                if (isTree && index === 0) {
                    this.insertFirstCellHtml();
                }
                return;
            }

            let cellClasses = gridColumn.customClass ? `${gridColumn.customClass} ` : '';
            if (gridColumn.editable) cellClasses += classes.cellEditable;

            const cellView = new cell({
                className: `cell ${gridColumn.columnClass} ${cellClasses}`,
                schema: gridColumn,
                model: this.model,
                key: gridColumn.key
            });

            if (isTree && index === 0) {
                cellView.on('render', () => this.insertFirstCellHtml(true));
            }
            cellView.render();
            this.el.insertAdjacentElement('beforeend', cellView.el);
            cellView.triggerMethod('attach');

            this.cellViews.push(cellView);
        });
    },

    __handleChange() {
        const changed = this.model.changedAttributes();
        if (changed) {
            this.getOption('columns').forEach((column, index) => {
                if (Object.prototype.hasOwnProperty.call(changed, column.key) && !column.cellView && !column.editable) {
                    const elements = this.el.getElementsByClassName(this.columnClasses[index]);
                    if (elements.length) {
                        elements[0].insertAdjacentHTML('afterend', CellViewFactory.getCellHtml(column, this.model));
                        this.el.removeChild(elements[0]);
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
        if ((!this.el.contains(event.relatedTarget) && this.model.collection.dragoverModel !== this.model)
            || event.relatedTarget.classList.contains('js-grid-content-view')) {
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
            const lastEditor = this.lastPointedEl.querySelector('input') || this.lastPointedEl.querySelector('[class~=editor]');
            if (lastEditor) {
                lastEditor.blur();
            }
            this.lastPointedEl.classList.remove(classes.cellFocused);
        }
        const pointedEls = this.el.getElementsByClassName(this.columnClasses[pointed]);
        if (pointedEls && pointedEls.length) {
            const pointedEl = pointedEls[0];
            const editor = pointedEl.querySelector('input') || pointedEl.querySelector('[class~=editor]');

            if (editor) {
                const view = this.cellViews[pointed];
                if (view && view.editor && view.editor.hidden) {
                    view.model.trigger('select:hidden');
                    return false;
                }
                if (!pointedEl.contains(document.activeElement)) {
                    editor.focus();
                }
            }
            pointedEl.classList.add(classes.cellFocused);
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
