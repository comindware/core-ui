import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import NodeViewConfig from '../services/NodeViewConfig';

export default Marionette.CollectionView.extend(
    Object.assign(
        {
            initialize(options) {
                this.collection = options.model.get(options.model.childrenAttribute);
            },

            className: 'branch-item',

            childView(childModel) {
                return NodeViewFactory.getNodeView(childModel);
            },

            childViewOptions() {
                return _.omit(this.options, 'parent', 'model');
            },

            childViewContainer: '.js-branch-collection'
        },
        NodeViewConfig(template)
    )
);
