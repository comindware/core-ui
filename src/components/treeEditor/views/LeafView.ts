import template from '../templates/leaf.hbs';
import NodeViewConfig from '../services/NodeViewConfig';

export default Marionette.View.extend(
    Object.assign(
        {
            attributes: {
                draggable: 'true'
            },

            className: 'leaf-item tree-item'
        },
        NodeViewConfig(template)
    )
);
