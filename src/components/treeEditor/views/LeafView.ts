import template from '../templates/leaf.hbs';
import NodeViewConfig from '../services/NodeViewConfig';

export default Marionette.View.extend({
    attributes: {
        draggable: 'true'
    },

    ...NodeViewConfig(template, 'leaf-item tree-item')
});
