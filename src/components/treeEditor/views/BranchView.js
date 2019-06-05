import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import eyeBehavior from '../behaviors/eyeBehavior';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.collection = options.model.get(options.model.childrenAttribute);
    },

    template: Handlebars.compile(template),

    className: 'branch-item',

    templateContext() {
        return {
            text: this.model.get('name'),
            eyeIconClass: this.model.get('isHidden') ? this.options.closedEyeIconClass : this.options.eyeIconClass
        };
    },

    behaviors: {
        eyeBehavior: {
            behaviorClass: eyeBehavior
        }
    },

    childView(childModel) {
        return NodeViewFactory.getNodeView(childModel);
    },

    childViewOptions() {
        return _.omit(this.options, 'parent', 'model');
    },

    childViewContainer: '.js-branch-collection'
});
