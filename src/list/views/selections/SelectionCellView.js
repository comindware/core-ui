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
        if (this.getOption('draggable')) {
            return {
                draggable: true
            };
        }
    },

    templateContext() {
        let index = '';
        if (this.getOption('showRowIndex') && this.model) {
            index = this.model.collection.indexOf(this.model) + 1;
        }
        return {
            index,
            showCheckbox: this.getOption('showCheckbox')
        };
    },

    className() {
        return `${this.options.showRowIndex ? 'cell_selection-index' : 'cell_selection'} ${this.options.showCheckbox ? '' : 'cell_selection__narrow'} ${
            this.options.checkboxColumnClass
        }`;
    },

    ui: {
        checkbox: '.js-checkbox',
        dots: '.js-dots',
        index: '.js-index'
    },

    events: {
        dragstart: '__handleDragStart',
        dragend: '__handleDragEnd',
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
        mouseleave: '__handleModelMouseLeave',
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

    __handleDblClick(event) {
        if (!this.selectAllCell) {
            this.model.trigger('dblclick', event);
        }
    },

    __handleClick(event) {
        if (!this.selectAllCell) {
            this.model.trigger('click', event);
        }
        if (this.selectAllCell) {
            this.collection.toggleCheckAll();
        } else {
            this.model.toggleChecked();
            if (this.getOption('bindSelection')) {
                this.model.collection.updateTreeNodesCheck(this.model);
            }
        }
    },

    __handleDragStart(event) {
        this.collection.draggingModel = this.model;
        event.originalEvent.dataTransfer.setData('Text', this.cid); // fix for FireFox
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
        if (this.model ? this.collection.dragoverModel !== this.model : this.collection.dragoverModel !== undefined) {
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
        event.preventDefault();
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
