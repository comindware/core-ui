import TEButtonView from './views/TEButtonView';
import NodeViewFactory from './services/NodeViewFactory';

const defaultOptions = {
    eyeIconClass: 'eye',
    closedEyeIconClass: 'eye-slash',
    configDiff: {}
};

export default class treeVisualEditor {
    constructor(options) {
        _.defaults(options, defaultOptions);
        this.configDiff = options.configDiff;
        this.model = options.model;

        const reqres = Backbone.Radio.channel(_.uniqueId('treeEditor'));

        const popoutView = Core.dropdown.factory.createPopout({
            buttonView: TEButtonView,
            buttonViewOptions: {
                iconClass: options.eyeIconClass
            },

            panelView: NodeViewFactory.getNodeView(options.model),
            panelViewOptions: {
                model: options.model,
                eyeIconClass: options.eyeIconClass,
                closedEyeIconClass: options.closedEyeIconClass,
                reqres,
                maxWidth: 300
            }
        });

        reqres.reply('personalFormConfiguration:setWidgetConfig', (id, config) => this.applyConfigDiff(id, config));
        popoutView.listenTo(popoutView, 'close', () => popoutView.trigger('save', this.configDiff));

        return popoutView;
    }

    applyConfigDiff(id, config) {
        if (this.configDiff[id]) {
            Object.assign(this.configDiff[id], config);
        } else {
            this.configDiff[id] = config;
        }
    }
}
