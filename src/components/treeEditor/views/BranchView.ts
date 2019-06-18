import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import NodeViewConfig from '../services/NodeViewConfig';

export default Marionette.CollectionView.extend({
    initialize(options: { model: any, unNamedType?: string, stopNestingType?: string }) {
        this.collection = options.model.get(options.model.childrenAttribute);
    },

    childView(childModel) {
        return NodeViewFactory.getNodeView({
            model: childModel,
            unNamedType: this.options.unNamedType,
            stopNestingType: this.options.stopNestingType,
            forceBranchType: this.options.forceBranchType
        });
    },

    childViewOptions() {
        const { parent, model, ...res } = this.options;
        return res;
    },

    childViewContainer: '.js-branch-collection',

    ...NodeViewConfig(template, 'branch-item')
});
