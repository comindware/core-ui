//@flow
import template from '../../templates/selectionCell.hbs';

const config = {
    TRANSITION_DELAY: 400
};

const selectionTypes = {
    all: 'all',
    single: 'single'
};

const classes = {
    checked: 'editor_checked',
    checked_some: 'editor_checked_some',
    selected: 'selected',
    dragover: 'dragover',
    hover: 'hover',
    hover__transition: 'hover__transition',
    rowChecked: 'row-checked'
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

    attributes() {
        return {
            draggable: this.getOption('draggable'),
            showCheckbox: this.getOption('showCheckbox')
        };
    },

    templateContext() {
        let index = '';
        if (this.getOption('showRowIndex') && this.model) {
            index = this.model.collection.indexOf(this.model) + 1;
        }
        return {
            draggable: this.getOption('draggable'),
            index,
            showCheckbox: this.getOption('showCheckbox')
        };
    },

    className() {
        return `${this.getOption('draggable') ? 'js-dots cell_draggable' : ''} ${this.options.showRowIndex ? 'cell_selection-index' : 'cell_selection'}`;
    },

    ui: {
        checkbox: '.js-checkbox',
        dots: '.js-dots',
        index: '.js-index'
    },

    events: {
        'pointerdown @ui.checkbox': '__handleCheckboxClick',
        dragstart: '__handleDragStart',
        dragend: '__handleDragEnd',
        click: '__handleClick',
        dblclick: '__handleDblClick',
        dragover: '__handleDragOver',
        dragenter: '__handleDragEnter',
        dragleave: '__handleDragLeave',
        drop: '__handleDrop',
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
        blink: '__blink',
        checked: '__addCheckedClass',
        unchecked: '__removeCheckedClass'
    },

    onRender() {
        this.__updateState();

        if (this.getOption('selectionType') === selectionTypes.all) {
            this.listenTo(this.collection, 'check:all check:none check:some', this.__updateState);
            this.listenTo(this.collection, 'dragover:head', this.__handleModelDragOver);
            this.listenTo(this.collection, 'dragleave:head', this.__handleModelDragLeave);
            this.listenTo(this.collection, 'drop:head', this.__handleModelDrop);
        } else {
            this.listenTo(this.model, 'checked unchecked checked:some', this.__updateState);
            if (this.model.selected) {
                this.__handleSelection();
            }
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
        this.collection.dragoverModel = this.model;
        this.__triggerIfAllow('dragover', event);
    },

    __triggerIfAllow(eventName, event) {
        const draggingModel = this.collection.draggingModel;
        if (!draggingModel) {
            return;
        }
        if (!this.__findInParents(this.collection.draggingModel, this.model)) {
            if (this.selectAllCell) {
                if (this.collection.indexOf(this.collection.draggingModel) > 0) {
                    this.collection.trigger(`${eventName}:head`, event);
                }
            } else if (!(this.collection.indexOf(this.model) + 1 === this.collection.indexOf(this.collection.draggingModel) && this.model.level <= draggingModel.level)) {
                this.model.trigger(eventName, event);
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
        if (
            (!this.el.contains(event.relatedTarget) && (this.model ? this.collection.dragoverModel !== this.model : this.collection.dragoverModel !== undefined)) ||
            event.relatedTarget.classList.contains('js-grid-content-view') ||
            event.relatedTarget.classList.contains('js-grid-selection-panel-view')
        ) {
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
        this.__triggerIfAllow('drop', event);
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

    __updateState(model, checkedState) {
        let state = checkedState;
        if (!state && !this.selectAllCell) {
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
    },

    __handleModelMouseEnter() {
        this.el.classList.add(classes.hover);
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
    }
});
