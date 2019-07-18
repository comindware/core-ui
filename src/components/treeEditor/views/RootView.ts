import BranchView from './BranchView';
import template from '../templates/root.hbs';
import CollapsibleBehavior from '../behaviors/CollapsibleBehavior';
import { getIconAndPrefixerClasses, setModelHiddenAttribute } from '../meta';
import LocalizationService from '../../../services/LocalizationService';

export default BranchView.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            ...BranchView.prototype.templateContext.call(this),
            hasContainerChilds: this.__hasContainerChilds()
        };
    },

    behaviors() {
        return this.__hasContainerChilds()
            ? {
                  CollapsibleBehavior: {
                      behaviorClass: CollapsibleBehavior
                  }
              }
            : {};
    },

    id() {
        return _.uniqueId('treeEditor-root_');
    },

    attributes: {},

    className() {},

    ui: {
        eyeBtn: '.js-eye-btn'
    },

    events: {
        'click @ui.eyeBtn': '__onEyeBtnClick'
    },

    collapseChildren(options: { interval: number, collapsed: boolean }) {
        this.children.forEach(view => view.toggleCollapsedState && view.toggleCollapsedState(options));
    },

    onRender() {
        this.__handleHideAll(!!this.model.areChildsHidden);
    },

    __onEyeBtnClick() {
        const areChildsHidden = (this.model.areChildsHidden = !this.model.areChildsHidden);

        this.__handleHideAll(areChildsHidden);
    },

    __handleHideAll(areChildsHidden) {
        const uiEyeElement = this.ui.eyeBtn[0];

        if (uiEyeElement) {
            uiEyeElement.classList.remove(...getIconAndPrefixerClasses(this.__getIconClass(!areChildsHidden)));
            uiEyeElement.classList.add(...getIconAndPrefixerClasses(this.__getIconClass(areChildsHidden)));
        }

        this.collection.forEach(model => setModelHiddenAttribute(model, areChildsHidden));
        this.el.querySelector('.js-root-header-name').innerText = areChildsHidden
            ? LocalizationService.get('CORE.TOOLBAR.BLINKCHECKBOX.SHOWALL')
            : LocalizationService.get('CORE.TOOLBAR.BLINKCHECKBOX.HIDEALL');
    },

    __hasContainerChilds() {
        return !!this.options.model.get(this.options.model.childrenAttribute).find(model => model.isContainer);
    }
});
