import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import NodeViewConfig from '../services/NodeViewConfig';

const iconNames = {
    collapsed: 'chevron-right',
    expanded: 'chevron-down'
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
            expandIconClass: this.__getExpandIconClass(),
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

    __getExpandIconClass() {
        return this.model.collapsed ? iconNames.collapsed : iconNames.expanded;
    },

    ui: {
        expandBtn: '.js-expand-btn'
    },

    events: {
        'click @ui.expandBtn': '__handleExpandClick'
    },

    __handleExpandClick(event) {
        event.stopPropagation();

        this.model.collapsed = !this.model.collapsed;
        this.render();
        this.options.reqres.request('treeEditor:resize');
    },

    ...NodeViewConfig(template, 'js-branch-item branch-item')
});
