import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import NodeViewConfig from '../services/NodeViewConfig';
import NodeBehavior from '../behaviors/NodeBehavior';
import CollapsibleBehavior from '../behaviors/CollapsibleBehavior';
import meta from '../meta';

const iconNames = meta.iconNames;

export default Marionette.CollectionView.extend({
    initialize(options: { model: any, unNamedType?: string, stopNestingType?: string, childsFilter?: any }) {
        this.collection = options.model.get(options.model.childrenAttribute);
        this.__initCollapsedState();
        this.collapseClassElement = [...this.el.childNodes].find(childNode => childNode.classList.contains('js-tree-item'));

        if (options.childsFilter) {
            this.setFilter(options.childsFilter);
        }
    },

    templateContext() {
        return {
            text: this.__getNodeName(),
            eyeIconClass: this.__getIconClass(),
            collapseIconClass: iconNames.expand,
            collapsed: this.model.collapsedNode
        };
    },

    childView(childModel) {
        return NodeViewFactory.getNodeView({
            model: childModel,
            unNamedType: this.options.unNamedType,
            stopNestingType: this.options.stopNestingType,
            forceBranchType: this.options.forceBranchType,
            forceLeafType: this.options.forceLeafType,
            childsFilter: this.options.childsFilter
        });
    },

    childViewOptions() {
        const { parent, model, ...res } = this.options;
        return res;
    },

    childViewContainer: '.js-branch-collection',

    behaviors: {
        NodeBehavior: {
            behaviorClass: NodeBehavior
        },
        CollapsibleBehavior: {
            behaviorClass: CollapsibleBehavior
        }
    },

    collapseChildren(options: { interval: number, collapsed: boolean }) {
        const { interval, collapsed } = options;

        if (collapsed) {
            this.$el.children('.js-branch-collection').hide(interval);
        } else {
            this.$el.children('.js-branch-collection').show(interval);
        }
    },

    __initCollapsedState() {
        if (this.model.collapsedNode == null) {
            this.model.collapsedNode = true;
        }
    },

    ...NodeViewConfig(template, 'js-branch-item branch-item')
});
