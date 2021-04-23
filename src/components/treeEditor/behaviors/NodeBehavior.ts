import { getIconAndPrefixerClasses, setModelHiddenAttribute } from '../meta';

const classes = {
    hiddenClass: 'hidden-node',
    dragover: 'dragover'
};

const getSiblings = (element: ChildNode) => {
    return Array.from(element.parentElement?.childNodes || []);
};

export default Marionette.Behavior.extend({
    initialize() {
        this.listenTo(this.view.options.model, 'change:isHidden', () => this.__handleHiddenChange());
    },

    ui: {
        eyeBtn: '.js-eye-btn',
        checkbox: '.js-checkbox'
    },

    events: {
        'click @ui.eyeBtn': '__onEyeBtnClick',
        'click @ui.checkbox': '__onCheckboxClick',
        dragenter: '__handleDragEnter',
        dragover: '__handleDragOver',
        dragleave: '__handleDragLeave',
        dragend: '__handleDragEnd',
        drop: '__handleDrop',
        dragstart: '__handleDragStart'
    },
    __onEyeBtnClick(event: MouseEvent) {
        event.stopPropagation();
        setModelHiddenAttribute(this.view.options.model);
    },

    __onCheckboxClick(event: MouseEvent) {
        event.stopPropagation();
        setModelHiddenAttribute(this.view.options.model);
    },

    __handleHiddenChange() {
        this.view.render();
    },
    __handleDragStart(event: JQueryEventObject) {
        event.stopPropagation();
        this.view.model.collection.draggingModel = this.view.model;
    },

    __handleDragEnter(event: JQueryEventObject) {
        const fromElement = event.originalEvent.fromElement;
        const targetElement = event.target;

        if (this.__isUiElement(fromElement) || this.__isUiElement(targetElement)) {
            return;
        }

        const realTarget = this.__getRealTargetElement(targetElement);

        if (this.__isInValidDropTarget(realTarget)) {
            return;
        }

        if (this.__validateEnterLeaveElements(targetElement, fromElement)) {
            realTarget.classList.add(classes.dragover);
        }
    },

    __handleDragLeave(event: JQueryEventObject) {
        const fromElement = event.originalEvent.fromElement;
        const targetElement = event.target;

        if (this.__isUiElement(fromElement) || this.__isUiElement(targetElement)) {
            return;
        }

        if (this.__validateEnterLeaveElements(targetElement, fromElement)) {
            const realTarget = this.__getRealTargetElement(targetElement);
            realTarget.classList.remove(classes.dragover);
        }
    },

    __handleDragOver(event: JQueryEventObject) {
        if (this.__isInValidDropTarget()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    },

    __handleDragEnd(event: JQueryEventObject) {
        delete this.view.model.collection?.draggingModel;
    },

    __handleDrop(event: JQueryEventObject) {
        event.stopPropagation();
        const targetElement = this.__getDragoverParent(event.target);
        if (!targetElement) {
            return false;
        }

        const realTarget = this.__getRealTargetElement(targetElement);
        realTarget.classList.remove(classes.dragover);

        if (this.__isInValidDropTarget(realTarget)) {
            return false;
        }

        const collection = this.view.model.collection;
        const draggingModel = collection.draggingModel;
        const oldIndex = collection.indexOf(draggingModel);
        let newIndex = collection.lastIndexOf(this.view.model);
        if (newIndex !== 0 && newIndex - oldIndex < 0) {
            newIndex++;
        }

        collection.remove(draggingModel);
        collection.add(draggingModel, { at: newIndex });
        delete collection.draggingModel;

        const startIndex = oldIndex > newIndex ? newIndex : oldIndex;
        const endIndex = oldIndex > newIndex ? oldIndex : newIndex;
        const reqres = this.view.options.reqres;
    },

    __getWidgetId(model = this.view.model) {
        return model.id;
    },

    __getDragoverParent(elem: HTMLElement) {
        if (this.__isUiElement(elem)) {
            return elem.parentElement;
        }

        if (this.__classListContainsSome(elem, ['js-tree-item', 'js-unnamed-tree-item'])) {
            return elem;
        }
    },

    __isUiElement(elem: HTMLElement) {
        return this.__classListContainsSome(elem, ['branch-header-name', 'leaf-name', 'eye-btn']);
    },

    __isInValidDropTarget(element?: ChildNode | null) {
        const collection = this.view.model.collection;
        const draggingModel = collection.draggingModel;

        const isValid =
            collection &&
            collection.draggingModel &&
            this.view.model !== draggingModel &&
            collection.contains(draggingModel) &&
            (el => {
                const hasSiblings = !el || getSiblings(el).includes(this.view.el);

                return hasSiblings;
            })(element);

        return !isValid;
    },

    __getRealTargetElement(element: HTMLElement) {
        const isBranch = element.classList.contains('branch-header');

        return isBranch ? element.parentElement : element;
    },

    __validateEnterLeaveElements(targetElement: HTMLElement, fromElement: HTMLElement) {
        return (
            this.__classListContainsSome(targetElement, ['js-tree-item', 'js-unnamed-tree-item']) &&
            this.__classListContainsSome(fromElement, ['js-branch-item', 'js-branch-collection', 'js-leaf-item'])
        );
    },

    __classListContainsSome(element: HTMLElement, classArray: string[]) {
        if (!element) {
            return;
        }
        return classArray.some(className => element.classList.contains(className));
    }
});
