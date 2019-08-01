import TEButtonView from './views/TEButtonView';
import NodeViewFactory from './services/NodeViewFactory';
import DiffController from './controllers/DiffController';
import { TTreeEditorOptions, GraphModel } from './types';
import ConfigDiff from './classes/ConfigDiff';

const defaultOptions = {
    eyeIconClass: 'eye',
    closedEyeIconClass: 'eye-slash',
    configDiff: new Map(),
    getNodeName: undefined,
    showToolbar: false,
    childsFilter: undefined,
    nestingOptions: {}
};

export default class TreeEditor {
    configDiff: ConfigDiff;
    model: GraphModel;
    view: Backbone.View;
    controller: DiffController;
    constructor(options: TTreeEditorOptions) {
        _.defaults(options, defaultOptions);
        this.configDiff = options.configDiff;
        this.model = options.model;

        const reqres = Backbone.Radio.channel(_.uniqueId('treeEditor'));
        const nestingOptions = options.nestingOptions;

        this.controller = new DiffController({ configDiff: this.configDiff, graphModel: this.model, reqres, nestingOptions });

        const popoutView = Core.dropdown.factory.createPopout({
            buttonView: TEButtonView,
            buttonViewOptions: {
                iconClass: options.eyeIconClass
            },

            panelView: NodeViewFactory.getRootView({
                model: this.model,
                unNamedType: options.unNamedType,
                nestingOptions,
                showToolbar: options.showToolbar
            }),
            panelViewOptions: {
                ...options,
                reqres,
                maxWidth: 300
            }
        });

        reqres.reply('treeEditor:collapse', () => popoutView.adjustPosition(false));

        popoutView.once('attach', () => popoutView.adjustPosition(false)); // TODO it doesn't work like this
        popoutView.listenTo(popoutView, 'close', () => this.__onSave());
        if (options.showToolbar) {
            reqres.reply('command:execute', actionModel => this.__commandExecute(actionModel));
        }

        if (options.hidden) {
            popoutView.el.setAttribute('hidden', true);
        }

        popoutView.getConfigDiff = this.__getConfigDiff.bind(this);
        popoutView.setConfigDiff = this.__setConfigDiff.bind(this);
        popoutView.resetConfigDiff = this.__resetConfigDiff.bind(this);
        popoutView.reorderCollectionByIndex = this.controller.__reorderCollectionByIndex;

        return (this.view = popoutView);
    }

    __getConfigDiff() {
        return this.controller.configDiff;
    }

    __setConfigDiff(configDiff: ConfigDiff) {
        this.controller.set(configDiff);
    }

    __resetConfigDiff() {
        this.controller.reset();
    }

    __onSave() {
        this.view.trigger('save', this.__getConfigDiff());
    }

    __onReset() {
        this.__resetConfigDiff();
        this.view.trigger('reset');
    }

    __commandExecute(actionModel: Backbone.Model) {
        switch (actionModel.id) {
            case 'reset':
                this.__onReset();
                break;
            case 'apply':
                this.__onSave();
                break;
            default:
                break;
        }
    }
}
