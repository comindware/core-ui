import BranchView from './BranchView';
import template from '../templates/root.hbs';
import CollapsibleBehavior from '../behaviors/CollapsibleBehavior';
import { setModelHiddenAttribute } from '../meta';
import { GraphModel, RootViewFactoryOptions } from '../types';

export default BranchView.extend({
    initialize(options: RootViewFactoryOptions) {
        BranchView.prototype.initialize.call(this, options);

        let filteredModels = this.collection.filter((model: GraphModel) => !model.get('required'));
        const childsFilter = options.childsFilter;

        if (typeof childsFilter === 'function') {
            filteredModels = filteredModels.filter((model: GraphModel) => childsFilter({ model }));
        }

        const filteredCollection = (this.filteredCollection = new Backbone.Collection(filteredModels));
        this.listenTo(filteredCollection, 'change:isHidden', () => {
            if (filteredCollection.settingAllState) {
                return;
            }

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
        this.children.forEach((view: Backbone.View) => view.toggleCollapsedState && view.toggleCollapsedState(options));
    },

    __getHiddenPrevalence() {
        const slicedRequiredModels = this.filteredCollection;
        const isHiddenPrevalence = slicedRequiredModels.filter((model: GraphModel) => model.get('isHidden')).length > slicedRequiredModels.length / 2;

        return (this.model.allChildsHidden = isHiddenPrevalence);
    },

    __onEyeBtnClick(event: MouseEvent) {
        event.stopPropagation();
        const allChildsHidden = !this.model.allChildsHidden;

        this.__setHiiddenToChildsModels(allChildsHidden);
    },

    __setHiiddenToChildsModels(hidden: boolean) {
        this.model.allChildsHidden = hidden;
        this.filteredCollection.settingAllState = true;
        this.filteredCollection.forEach((model: GraphModel) => setModelHiddenAttribute(model, hidden));
        delete this.filteredCollection.settingAllState;
    },

    __hasContainerChilds() {
        const collection = this.options.model.get(this.options.model.childrenAttribute);
        return !!collection.find((model: GraphModel) => model.isContainer);
    }
});
