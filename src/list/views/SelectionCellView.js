//@flow
import template from '../templates/selectionCell.hbs';

const selectionTypes = {
    all: 'all',
    single: 'single'
};

const classes = {
    checked: 'editor_checked',
    checked_some: 'editor_checked_some',
    selected: 'selected',
    dragover: 'dragover',
    hover: 'hover'
};

export default Marionette.View.extend({
    initialize(options) {
        if (options.selectionType === selectionTypes.all) {
            this.collection = options.collection;
            this.selectAllCell = true;
        } else {
            this.collection = options.model.collection;
            this.model.currentIndex = this.model.collection.indexOf(this.model) + 1;
        }
    },

    template: Handlebars.compile(template),

    templateContext() {
        let index = '';
        if (this.getOption('showRowIndex') && this.model) {
            index = this.model.collection.indexOf(this.model) + 1;
        }
        return {
            draggable: this.getOption('draggable'),
            index
        };
    },

    className: 'cell cell_selection',

    ui: {
        checkbox: '.js-checkbox',
        dots: '.js-dots',
        index: '.js-index'
    },

    events: {
        'click @ui.checkbox': '__handleCheckboxClick',
        'dragstart @ui.dots': '__handleDragStart',
        'dragend @ui.dots': '__handleDragEnd',
        click: '__handleClick',
        dblclick: '__handleDblClick',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop',
        mouseenter: '__handleMouseEnter',
        mouseleave: '__handleMouseLeave',
        contextmenu: '__handleContextMenu'
    },

    modelEvents: {
        'update:model': '__updateIndex',
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        dragover: '__handleModelDragOver',
        dragleave: '__handleModelDragLeave',
        drop: '__handleModelDrop',
        mouseenter: '__handleModelMouseEnter',
        mouseleave: '__handleModelMouseLeave'
    },

    onRender() {
        this.__updateState();
        // todo: release it by stylesheet?
        if (this.options.showRowIndex) {
            this.el.classList.add('cell_selection-index');
        }
        if (this.getOption('selectionType') === selectionTypes.all) {
            this.listenTo(this.collection, 'check:all check:none check:some', this.__updateState);
            this.listenTo(this.collection, 'dragover:head', this.__handleModelDragOver);
            this.listenTo(this.collection, 'dragleave:head', this.__handleModelDragLeave);
            this.listenTo(this.collection, 'drop:head', this.__handleModelDrop);
        } else {
            this.listenTo(this.model, 'checked unchecked checked:some', this.__updateState);
        }
    },

    __handleClick(event) {
        if (!this.selectAllCell) {
            this.model.trigger('click', event);
        }
    },

    __handleDblClick(event) {
        if (!this.selectAllCell) {
            this.model.trigger('dblclick', event);
        }
    },

    __handleCheckboxClick() {
        if (this.selectAllCell) {
            this.collection.toggleCheckAll();
        } else {
            this.model.toggleChecked();
            if (this.getOption('bindSelection')) {
                this.model.collection.updateTreeNodesCheck(this.model);
            }
        }
    },

    __handleDragStart() {
        this.collection.draggingModel = this.model;
    },

    __handleDragEnd() {
        delete this.collection.draggingModel;
        delete this.collection.dragoverModel;
    },

    __handleDragOver(event) {
        event.preventDefault();
    },

    __handleDragEnter(event) {
        if (!this.collection.draggingModel) {
            return;
        }
        this.collection.dragoverModel = this.model;
        if (this.collection.draggingModel !== this.model && !this.__findInParents(this.collection.draggingModel, this.model)) {
            if (this.selectAllCell) {
                this.collection.trigger('dragover:head', event);
            } else {
                this.model.trigger('dragover', event);
            }
        }
    },

    __findInParents(draggingModel, model) {
        if (model === draggingModel) {
            return true;
        }
        if (model && model.parentModel) {
            return this.__findInParents(draggingModel, model.parentModel);
        }
        return false;
    },

    __handleModelDragOver() {
        this.el.classList.add(classes.dragover);
    },

    __handleDragLeave(event) {
        if (!this.el.contains(event.relatedTarget) && this.collection.dragoverModel !== this.model) {
            if (this.selectAllCell) {
                this.collection.trigger('dragleave:head', event);
            } else {
                this.model.trigger('dragleave', event);
                delete this.model.dragover;
            }
        }
    },

    __handleModelDragLeave() {
        this.el.classList.remove(classes.dragover);
    },

    __handleDrop(event) {
        if (this.selectAllCell) {
            this.collection.trigger('drop:head', event);
        } else {
            this.model.trigger('drop', event);
        }
    },

    __handleModelDrop() {
        this.el.classList.remove(classes.dragover);
        if (this.collection.draggingModel) {
            this.trigger('drag:drop', this.collection.draggingModel, this.model);
        }
    },

    __handleContextMenu(event) {
        if (!this.selectAllCell) {
            this.model.trigger('contextmenu', event);
        }
    },

    __updateIndex(index) {
        if (this.model && this.isRendered()) {
            this.model.currentIndex = index;
            this.ui.index.text(index);
        }
    },

    __handleSelection() {
        this.el.classList.add(classes.selected);
    },

    __handleDeselection() {
        this.el.classList.remove(classes.selected);
    },

    __updateState(model, stateCollection) {
        if (this.selectAllCell) {
            if (stateCollection === 'none') {
                this.ui.checkbox.removeClass(classes.checked);
                this.ui.checkbox.removeClass(classes.checked_some);
            }
            if (stateCollection === 'all') {
                this.ui.checkbox.addClass(classes.checked);
                this.ui.checkbox.removeClass(classes.checked_some);
            }
            if (stateCollection === 'some') {
                this.ui.checkbox.removeClass(classes.checked);
                this.ui.checkbox.addClass(classes.checked_some);
            }
        } else if (this.model.checked) {
                this.ui.checkbox.addClass(classes.checked);
        } else {
                this.ui.checkbox.removeClass(classes.checked);
        }
    },

    __handleMouseEnter() {
        if (this.model) {
            this.model.trigger('mouseenter');
        }
    },

    __handleModelMouseEnter() {
        this.el.classList.add(classes.hover);
    },

    __handleMouseLeave() {
        if (this.model) {
            this.model.trigger('mouseleave');
        }
    },

    __handleModelMouseLeave() {
        this.el.classList.remove(classes.hover);
    }
});
