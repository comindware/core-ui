import template from '../templates/leaf.hbs';
import NodeViewConfig from '../services/NodeViewConfig';
import NodeBehavior from '../behaviors/NodeBehavior';

export default Marionette.View.extend({
    templateContext() {
        return {
            text: this.__getNodeName(),
            isVisible: !this.model.get('isHidden')
        };
    },

    behaviors: {
        NodeBehavior: {
            behaviorClass: NodeBehavior
        }
    },

    ...NodeViewConfig(template, 'js-leaf-item js-tree-item leaf-item tree-item')
});
