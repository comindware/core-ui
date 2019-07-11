import template from '../templates/leaf.hbs';
import NodeViewConfig from '../services/NodeViewConfig';
import NodeBehavior from '../behaviors/NodeBehavior';

export default Marionette.View.extend({
    templateContext() {
        return {
            text: this.__getNodeName(),
            eyeIconClass: this.__getIconClass()
        };
    },

    attributes: {
        draggable: 'true'
    },

    behaviors: {
        NodeBehavior: {
            behaviorClass: NodeBehavior
        }
    },

    ...NodeViewConfig(template, 'js-leaf-item js-tree-item leaf-item tree-item')
});
