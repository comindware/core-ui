import TEButtonView from './views/TEButtonView';
import NodeViewFactory from './services/NodeViewFactory';

const defaultOptions = {
    eyeIconClass: 'eye',
    closedEyeIconClass: 'eye-slash'
};

export default class treeVisualEditor {
    constructor(options) {
        _.defaults(options, defaultOptions);

        return Core.dropdown.factory.createPopout({
            buttonView: TEButtonView,
            buttonViewOptions: {
                iconClass: options.eyeIconClass
            },

            panelView: NodeViewFactory.getNodeView(options.model),
            panelViewOptions: {
                model: options.model,
                eyeIconClass: options.eyeIconClass,
                closedEyeIconClass: options.closedEyeIconClass,
                maxWidth: 300
            }
        });
    }
}
