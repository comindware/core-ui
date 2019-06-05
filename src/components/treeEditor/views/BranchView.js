import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.collection = options.model.get(options.model.childrenAttribute);
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.model.get('name')
        };
    },

    childView(childModel) {
        return NodeViewFactory.getNodeView(childModel);
    }
});
