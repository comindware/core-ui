import NodeViewFactory from '../services/NodeViewFactory';
import template from '../templates/branch.hbs';
import eyeBehavior from '../behaviors/eyeBehavior';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.collection = options.model.get(options.model.childrenAttribute);
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.options.getNodeName && typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || '',
            eyeIconClass: this.model.get('isHidden') ? this.options.closedEyeIconClass : this.options.eyeIconClass,
            elementId: _.uniqueId('treeEditor_')
        };
    },

    id() {
        return _.uniqueId('treeEditor_');
    },

    behaviors: {
        eyeBehavior: {
            behaviorClass: eyeBehavior
        }
    },

    className: 'branch-item',

    childView(childModel) {
        return NodeViewFactory.getNodeView(childModel);
    },

    childViewOptions() {
        return _.omit(this.options, 'parent', 'model');
    },

    childViewContainer: '.js-branch-collection'
});
