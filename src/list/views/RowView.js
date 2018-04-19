//@flow
import CellViewFactory from '../CellViewFactory';

const classes = {
    selected: 'selected',
    expanded: 'collapsible-btn_expanded',
    collapsible: 'js-collapsible-button',
    dragover: 'dragover'
};

const defaultOptions = {
    levelMargin: 15,
    collapsibleButtonWidth: 14
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
    className: 'record-row grid-row',

    ui: {
        cells: '.js-grid-cell',
        collapsibleButton: '.js-collapsible-button'
    },

    events: {
        click: '__onClick',
        dblclick: '__onDblClick',
        'click @ui.collapsibleButton': '__toggleCollapse',
        dragover: '__handleDragOver',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop'
    },

    modelEvents: {
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        highlighted: '__handleHighlight',
        unhighlighted: '__handleUnhighlight',
        change: '__handleChange',
        dragover: '__handleModelDragOver',
        dragleave: '__handleModelDragLeave',
        drop: '__handleModelDrop'
    },

    initialize() {
        _.defaults(this.options, defaultOptions);

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

    updateCollapsed(collapsed, external) {
        const collaspibleButtons = this.el.getElementsByClassName(classes.collapsible);
        if (!collapsed) {
            this.model.expand();
            if (external) {
                this.model.hidden = false;
            }
            if (collaspibleButtons.length) {
                collaspibleButtons[0].classList.add(classes.expanded);
            }
        } else {
            this.model.collapse();
            if (this.model.level && external) {
                this.model.hidden = true;
            }
            if (collaspibleButtons.length) {
                collaspibleButtons[0].classList.remove(classes.expanded);
            }
        }
    },

    _renderTemplate() {
        this.cellViews = [];
        this.columnClasses = [];

        this.options.columns.forEach((gridColumn, index) => {
            const columnClass = `${this.getOption('uniqueId')}-column${index}`;
            const cell = gridColumn.cellView || CellViewFactory.getCellViewForColumn(gridColumn, this.model);
            if (typeof cell !== 'string') {
                const cellView = new cell({
                    className: `grid-cell ${columnClass}`,
                    schema: gridColumn,
                    model: this.model,
                    key: gridColumn.key
                });
                if (this.getOption('isTree') && index === 0) {
                    cellView.on('render', () => this.insertFirstCellHtml());
                }
                cellView.render();
                this.el.insertAdjacentElement('beforeend', cellView.el);

                this.cellViews.push(cellView);
            } else {
                this.el.insertAdjacentHTML('beforeend', `<div class="grid-cell ${columnClass}">${cell}</div>`);
                if (this.getOption('isTree') && index === 0) {
                    this.insertFirstCellHtml();
                }
            }
            this.columnClasses.push(columnClass);
        });
    },

    __handleChange() {
        const changed = this.model.changedAttributes();
        if (changed) {
            this.getOption('columns').forEach((column, index) => {
                if (changed[column.key] && !column.cellView) {
                    const elements = this.el.getElementsByClassName(this.columnClasses[index]);
                    if (elements.length) {
                        elements[0].innerHTML = CellViewFactory.getCellHtml(column, this.model);
                    }
                }
            });
        }
    },

    __handleDragOver(event) {
        if (!this.model.collection.dragginModel) {
            return;
        }
        this.model.trigger('dragover', event);
        event.preventDefault();
    },

    __handleModelDragOver() {
        this.el.classList.add(classes.dragover);
    },

    __handleDragLeave(event) {
        this.model.trigger('dragleave', event);
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
        if (this.isRendered) {
            const elements = this.el.getElementsByClassName(this.columnClasses[0]);
            if (elements.length) {
                const el = elements[0];
                const level = this.model.level || 0;
                const margin = level * this.options.levelMargin;
                const hasChildren = this.model.children && this.model.children.length;
                this.lastHasChildren = hasChildren;
                const treeFirstCell = el.getElementsByClassName('js-tree-first-cell')[0];
                if (treeFirstCell) {
                    if (this.lastHasChildren === hasChildren) {
                        return;
                    }

                    el.removeChild(treeFirstCell);
                }
                if (hasChildren) {
                    el.insertAdjacentHTML(
                        'afterbegin',
                        `<span class="js-tree-first-cell collapsible-btn ${classes.collapsible} ${
                            this.model.collapsed === false ? classes.expanded : ''
                            }" style="margin-left:${margin}px;"></span>`
                    );
                } else {
                    el.insertAdjacentHTML('afterbegin', `<span class="js-tree-first-cell" style="margin-left:${margin + defaultOptions.collapsibleButtonWidth}px;"></span>`);
                }
            }
        }
    },

    __onClick(e) {
        const model = this.model;
        const selectFn = model.collection.selectSmart || model.collection.select;
        if (selectFn) {
            selectFn.call(model.collection, model, e.ctrlKey, e.shiftKey);
        }
        this.trigger('click', this.model);
    },

    __onDblClick() {
        this.trigger('dblclick', this.model);
    },

    setFitToView() {
        this.__setInitialWidth();
    },

    __handleSelection() {
        this.el.classList.add(classes.selected);
    },

    __handleDeselection() {
        this.el.classList.remove(classes.selected);
    },

    __toggleCollapse() {
        this.updateCollapsed(this.model.collapsed === undefined ? false : !this.model.collapsed);
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
    }
});
