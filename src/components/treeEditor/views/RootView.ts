import BranchView from './BranchView';
import template from '../templates/root.hbs';
import CollapsibleBehavior from '../behaviors/CollapsibleBehavior';
import { getIconAndPrefixerClasses, setModelHiddenAttribute } from '../meta';
import LocalizationService from '../../../services/LocalizationService';

export default BranchView.extend({
    initialize(options) {
        BranchView.prototype.initialize.call(this, options);

        let filteredModels = this.collection.filter(model => !model.get('required'));
        if (options.childsFilter) {
            filteredModels = filteredModels.filter(model => options.childsFilter.call({}, { model }));
        }

        const filteredCollection = (this.filteredCollection = new Backbone.Collection(filteredModels));
        this.listenTo(filteredCollection, 'change:isHidden', () => {
            if (filteredCollection.settingAllState) {
                return;
            }

            this.__toggleHideAll(this.__getHiddenPrevalence());

            // TODO refactor: do the same thing for CollapsibleBehavior, then join them into one core behavior
        });
    },

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
        this.__toggleHideAll(this.__getHiddenPrevalence());
    },

    __getHiddenPrevalence() {
        const slicedRequiredModels = this.filteredCollection;
        const isHiddenPrevalence = slicedRequiredModels.filter(model => model.get('isHidden')).length > slicedRequiredModels.length / 2;

        return (this.model.allChildsHidden = isHiddenPrevalence);
    },

    __onEyeBtnClick(event: MouseEvent) {
        event.stopPropagation();
        const allChildsHidden = !this.model.allChildsHidden;

        this.__settHiiddenToChildsModels(allChildsHidden);
        this.__toggleHideAll(allChildsHidden);
    },

    __toggleHideAll(allChildsHidden: boolean) {
        const uiEyeElement = this.ui.eyeBtn[0];

        if (uiEyeElement) {
            uiEyeElement.classList.remove(...getIconAndPrefixerClasses(this.__getIconClass(allChildsHidden)));
            uiEyeElement.classList.add(...getIconAndPrefixerClasses(this.__getIconClass(!allChildsHidden)));
        }

        this.el.querySelector('.js-root-header-name').innerText = allChildsHidden
            ? LocalizationService.get('CORE.TOOLBAR.BLINKCHECKBOX.SHOWALL')
            : LocalizationService.get('CORE.TOOLBAR.BLINKCHECKBOX.HIDEALL');
    },

    __settHiiddenToChildsModels(hidden) {
        this.model.allChildsHidden = hidden;
        this.filteredCollection.settingAllState = true;
        this.filteredCollection.forEach(model => setModelHiddenAttribute(model, hidden));
        delete this.filteredCollection.settingAllState;
    },

    __hasContainerChilds() {
        return !!this.options.model.get(this.options.model.childrenAttribute).find(model => model.isContainer);
    }
});
