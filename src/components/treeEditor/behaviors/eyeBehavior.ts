const classes = {
    hiddenClass: 'hidden-node',
    dragover: 'dragover'
};
const dataTransferKey = 'source-datatransfer-key';
const isHiddenPropName = 'isHidden';

export default Marionette.Behavior.extend({
    initialize() {
        this.listenTo(this.view.options.model, 'change:isHidden', () => this.__handleHiddenChange());
    },

    ui: {
        eyeBtn: '.js-eye-btn'
    },

    events: {
        'click @ui.eyeBtn': '__handleEyeClick',
        dragenter: '__handleDragEnter',
        dragover: '__handleDragOver',
        dragleave: '__handleDragLeave',
        dragend: '__handleDragEnd',
        drop: '__handleDrop',
        dragstart: '__handleDragStart'
    },

    onRender() {
        this.__toggleHiddenClass();
    },

    __handleEyeClick(event) {
        event.stopPropagation();
        const model = this.view.options.model;
        if (model.get('required')) {
            return;
        }

        const isHidden = model.get(isHiddenPropName);

        model.set(isHiddenPropName, !isHidden);
    },

    __handleHiddenChange() {
        this.view.options.reqres.request('treeEditor:setWidgetConfig', this.view.model.id, { isHidden: this.view.model.get('isHidden') });
        this.view.render();
        this.__toggleHiddenClass();
    },

    __toggleHiddenClass() {
        const isHidden = !!this.view.model.get(isHiddenPropName);

        this.el.classList.toggle(classes.hiddenClass, isHidden);
    },

    __handleDragStart(event) {
        event.stopPropagation();
        this.view.model.collection.draggingModel = this.view.model;
        event.originalEvent.dataTransfer.setData(dataTransferKey, this.__isBranch(event.target) ? event.target.parentNode.id : event.target.id);
    },

    __handleDragEnter(event) {
        if (this.__isUiElement(event.target)) {
            return;
        }

        event.stopPropagation();

        if (this.__isInValidDropTarget()) {
            return;
        }

        event.preventDefault();
        const element = event.target;
        const targetElement = this.__isBranch(element) ? element.parentNode : element;

        targetElement.classList.add(classes.dragover);
    },

    __handleDragOver(event) {
        event.stopPropagation();
        if (this.__isInValidDropTarget()) {
            return;
        }

        event.preventDefault();
    },

    __handleDragLeave(event) {
        if (this.__isUiElement(event.target)) {
            return;
        }

        event.stopPropagation();
        event.target.classList.remove(classes.dragover);
        // const targetElement = event.target;
        // // const element = this.__getDragoverParent(targetElement);
        // if (!element || targetElement === this.__isUiElement(targetElement)) {
        //     return false;
        // }
        // (this.__isBranch(element) ? element.parentNode : element).classList.remove(classes.dragover);
    },

    __handleDragEnd(event) {
        delete this.view.model.collection?.draggingModel;
    },

    __handleDrop(event) {
        event.stopPropagation();
        const targetElement = this.__getDragoverParent(event.target);
        if (!targetElement) {
            return false;
        }
        const sourceElement = document.getElementById(event.originalEvent.dataTransfer.getData(dataTransferKey));

        const trueTarget = this.__isBranch(targetElement) ? targetElement.parentNode : targetElement;
        trueTarget.classList.remove(classes.dragover);

        if (this.__isInValidDropTarget(trueTarget, sourceElement)) {
            return false;
        }

        const collection = this.view.model.collection;
        const draggingModel = collection.draggingModel;
        const oldIndex = collection.indexOf(draggingModel);
        const newIndex = Array.from(trueTarget.parentElement.childNodes).indexOf(trueTarget);

        collection.remove(draggingModel);
        collection.add(draggingModel, { at: newIndex });
        delete collection.draggingModel;

        const startIndex = oldIndex > newIndex ? newIndex : oldIndex;
        const endIndex = oldIndex > newIndex ? oldIndex : newIndex;
        const reqres = this.view.options.reqres;

        for (let i = startIndex; i <= endIndex; i++) {
            reqres.request('treeEditor:setWidgetConfig', collection.at(i).id, { index: i });
        }
    },

    __getDragoverParent(elem) {
        if (this.__isUiElement(elem)) {
            return elem.parentElement;
        }

        if (elem.classList.contains('tree-item')) {
            return elem;
        }
    },

    __isUiElement(elem) {
        return ['branch-header-name', 'leaf-name', 'eye-btn'].reduce((acc, cur) => acc || elem.classList.contains(cur), false);
    },

    __isInValidDropTarget() {
        const collection = this.view.model.collection;
        if (!collection) {
            return true;
        }

        if (!collection.draggingModel) {
            return true;
        }

        const draggingModel = collection.draggingModel;

        if (!collection.contains(draggingModel)) {
            return true;
        }

        if (this.view.model === draggingModel) {
            return true;
        }
    },

    __isBranch(element) {
        return element.classList.contains('branch-header');
    }
});
