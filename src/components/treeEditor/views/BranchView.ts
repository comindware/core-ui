import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import NodeViewConfig from '../services/NodeViewConfig';
import TreeEditorBehavior from '../behaviors/TreeEditorBehavior';
import ExpandBehavior from '../behaviors/ExpandBehavior';

const iconNames = {
    collapse: 'chevron-right',
    expand: 'chevron-down'
};

export default Marionette.CollectionView.extend({
    initialize(options: { model: any, unNamedType?: string, stopNestingType?: string }) {
        this.collection = options.model.get(options.model.childrenAttribute);
        if (this.model.collapsed == null) {
            this.model.collapsed = true;
        }
    },

    templateContext() {
        return {
            text: this.__getNodeName(),
            eyeIconClass: this.__getIconClass(),
            expandIconClass: this.model.collapsed ? iconNames.expand : iconNames.collapse,
            collapsed: this.model.collapsed
        };
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

    behaviors: {
        TreeEditorBehavior: {
            behaviorClass: TreeEditorBehavior
        },
        ExpandBehavior: {
            behaviorClass: ExpandBehavior
        }
    },

    ...NodeViewConfig(template, 'js-branch-item branch-item')
});
