//@flow
import template from '../templates/selectionCell.hbs';

const selectionTypes = {
    all: 'all',
    single: 'single'
};

const classes = {
    CHECKED: 'editor_checked',
    CHECKED_SOME: 'editor_checked_some',
    SELECTED: 'selected',
    DRAGOVER: 'dragover'
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
        'click @ui.checkbox': '__handleClick',
        'dragstart @ui.dots': '__handleDragStart',
        'dragend @ui.dots': '__handleDragEnd',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop'
    },

    modelEvents: {
        'update:model': '__updateIndex',
        selected: '__handleSelection',
        deselected: '__handleDeselection',
        dragover: '__handleModelDragOver',
        dragleave: '__handleModelDragLeave',
        drop: '__handleModelDrop'
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

    __handleClick() {
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
        this.el.classList.add(classes.DRAGOVER);
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
        this.el.classList.remove(classes.DRAGOVER);
    },

    __handleDrop(event) {
        if (this.selectAllCell) {
            this.collection.trigger('drop:head', event);
        } else {
            this.model.trigger('drop', event);
        }
    },

    __handleModelDrop() {
        this.el.classList.remove(classes.DRAGOVER);
        if (this.collection.draggingModel) {
            this.trigger('drag:drop', this.collection.draggingModel, this.model);
        }
    },

    __updateIndex(index) {
        if (this.model && this.isRendered()) {
            this.model.currentIndex = index;
            this.ui.index.text(index);
        }
    },

    __handleSelection() {
        this.ui.checkbox.addClass(classes.SELECTED);
    },

    __handleDeselection() {
        this.ui.checkbox.removeClass(classes.SELECTED);
    },

    __updateState() {
        let state;
        if (this.selectAllCell) {
            state = this.collection.checkedLength ? (this.collection.checkedLength === this.collection.length ? true : null) : false;
        } else {
            state = this.model.checked;
        }
        if (state) {
            this.ui.checkbox.addClass(classes.CHECKED);
            this.ui.checkbox.removeClass(classes.CHECKED_SOME);
        } else if (state === null) {
            this.ui.checkbox.removeClass(classes.CHECKED);
            this.ui.checkbox.addClass(classes.CHECKED_SOME);
        } else {
            this.ui.checkbox.removeClass(classes.CHECKED);
            this.ui.checkbox.removeClass(classes.CHECKED_SOME);
        }
    }
});
