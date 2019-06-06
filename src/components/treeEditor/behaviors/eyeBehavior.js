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

    onAttach() {
        this.__toggleHiddenClass();
    },

    __handleEyeClick() {
        event.stopPropagation();
        const model = this.view.options.model;
        if (model.get('required')) {
            return;
        }

        const isHidden = model.get(isHiddenPropName);

        model.set(isHiddenPropName, !isHidden);
    },

    __handleHiddenChange() {
        this.view.options.reqres.request('personalFormConfiguration:setWidgetConfig', this.view.model.id, { isHidden: this.view.model.get('isHidden') });
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
        event.preventDefault();
        const element = event.target;
        // if (this.__IsInvalidDropTarget(trueTarget, sourceElement)) {
        //     return false;
        // } //TODO validate dropZones
        (this.__isBranch(element) ? element.parentNode : element).classList.add(classes.dragover);
    },

    __handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
    },

    __handleDragLeave() {
        if (event.target === this.__getDragoverParent(event.fromElement)) {
            return false;
        }
        const element = this.__getDragoverParent(event.target);
        (this.__isBranch(element) ? element.parentNode : element).classList.remove(classes.dragover);
    },

    __handleDragEnd(event) {
        // event.target.classList.remove('dragover');
    },

    __handleDrop(event) {
        event.stopPropagation();
        const targetElement = this.__getDragoverParent(event.target);
        const sourceElement = document.getElementById(event.originalEvent.dataTransfer.getData(dataTransferKey));

        const trueTarget = this.__isBranch(targetElement) ? targetElement.parentNode : targetElement;
        trueTarget.classList.remove(classes.dragover);

        if (this.__IsInvalidDropTarget(trueTarget, sourceElement)) {
            return false;
        }

        const collection = this.view.model.collection;
        const draggingModel = collection.draggingModel;
        const oldIndex = collection.indexOf(draggingModel);
        const newIndex = Array.from(trueTarget.parentElement.childNodes).indexOf(trueTarget);

        collection.remove(draggingModel);
        collection.add(draggingModel, { at: newIndex });

        const startIndex = oldIndex > newIndex ? newIndex : oldIndex;
        const endIndex = oldIndex > newIndex ? oldIndex : newIndex;
        const reqres = this.view.options.reqres;

        for (let i = startIndex; i <= endIndex; i++) {
            reqres.request('personalFormConfiguration:setWidgetConfig', collection.at(i).id, { index: i });
        }
    },

    __getDragoverParent(elem) {
        let element = elem;
        let i = 0;
        while (!element.classList.contains('tree-item') && i < 5) {
            if (!element.parentElement) {
                break;
            }
            element = element.parentElement;
            i++;
        }
        return element;
    },

    __IsInvalidDropTarget(targetElement, sourceElement) {
        if (!sourceElement || targetElement === sourceElement) {
            return true;
        }
        if (targetElement.parentElement !== sourceElement.parentElement) {
            //if moving out of collection
            return true;
        }
    },

    __isBranch(element) {
        return element.classList.contains('branch-header');
    }
});
