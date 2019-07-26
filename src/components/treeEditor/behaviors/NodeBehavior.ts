import { getIconAndPrefixerClasses, setModelHiddenAttribute } from '../meta';

const classes = {
    hiddenClass: 'hidden-node',
    dragover: 'dragover',
    dragoverContainer: 'dragover-container'
};

const getSiblings = (element: HTMLElement) => {
    return Array.from(element.parentElement?.childNodes || []);
};

export default Marionette.Behavior.extend({
    initialize() {
        this.listenTo(this.view.options.model, 'change:isHidden', () => this.__handleHiddenChange());
    },

    ui: {
        eyeBtn: '.js-eye-btn'
    },

    events: {
        'click @ui.eyeBtn': '__onEyeBtnClick',
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

    __onEyeBtnClick(event: MouseEvent) {
        event.stopPropagation();
        setModelHiddenAttribute(this.view.options.model);
    },

    __handleHiddenChange() {
        this.view.options.reqres.request('treeEditor:setWidgetConfig', this.__getWidgetId(), { isHidden: this.view.model.get('isHidden') });

        this.__toggleHiddenClass();
    },

    __toggleHiddenClass() {
        const isHidden = !!this.view.model.get('isHidden');
        const uiEyeElement = this.ui.eyeBtn[0];

        if (uiEyeElement) {
            uiEyeElement.classList.remove(...getIconAndPrefixerClasses(this.view.__getIconClass(!isHidden)));
            uiEyeElement.classList.add(...getIconAndPrefixerClasses(this.view.__getIconClass(isHidden)));
        }

        this.el.classList.toggle(classes.hiddenClass, isHidden);
    },

    __handleDragStart(event: Event) {
        event.stopPropagation();
        this.view.model.collection.draggingModel = this.view.model;
        this.__getRealTargetElement(event.target).parentElement.classList.add(classes.dragoverContainer);
    },

    __handleDragEnter(event: Event) {
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

    __handleDragLeave(event: Event) {
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

    __handleDragOver(event: Event) {
        if (this.__isInValidDropTarget()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    },

    __handleDragEnd(event: Event) {
        delete this.view.model.collection?.draggingModel;
        this.__removeContainerDragoverClass();
    },

    __handleDrop(event: Event) {
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
        const newIndex = Array.from(realTarget.parentElement.childNodes).indexOf(realTarget);

        collection.remove(draggingModel);
        collection.add(draggingModel, { at: newIndex });
        delete collection.draggingModel;

        this.__removeContainerDragoverClass();

        const startIndex = oldIndex > newIndex ? newIndex : oldIndex;
        const endIndex = oldIndex > newIndex ? oldIndex : newIndex;
        const reqres = this.view.options.reqres;

        for (let i = startIndex; i <= endIndex; i++) {
            reqres.request('treeEditor:setWidgetConfig', this.__getWidgetId(collection.at(i)), { index: i });
        }
    },

    __removeContainerDragoverClass() {
        this.el.parentElement.classList.remove(classes.dragoverContainer);
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
        if (!collection) {
            return true;
        }

        if (!collection.draggingModel) {
            return true;
        }

        const draggingModel = collection.draggingModel;

        if (this.view.model === draggingModel) {
            return true;
        }

        if (!collection.contains(draggingModel)) {
            return true;
        }

        if (element && !getSiblings(element).includes(this.view.el)) {
            return true;
        }
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
