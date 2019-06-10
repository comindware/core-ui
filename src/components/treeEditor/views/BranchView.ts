import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import NodeViewConfig from '../services/NodeViewConfig';

export default Marionette.CollectionView.extend(
    Object.assign(
        {
            initialize(options) {
                // const childrenParh = options.model.childrenAttribute.split('.');
                // this.collection = options.model.get(childrenParh[0]);
                // for (let i = 1; i < childrenParh.length; i++) {
                //     this.collection = this.collection.get(childrenParh[i]);
                // }
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
