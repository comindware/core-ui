import TEButtonView from './views/TEButtonView';
import NodeViewFactory from './services/NodeViewFactory';
import TreeDiffController from './controllers/TreeDiffController';

const defaultOptions = {
    eyeIconClass: 'eye',
    closedEyeIconClass: 'eye-slash',
    configDiff: {},
    getNodeName: undefined,
    showToolbar: false
};

interface TConfigDiff {
    [key: string]: {
        index?: number,
        isHidden?: boolean
    };
}

type TTreeEditorOptions = {
    model: any,
    hidden?: boolean,
    eyeIconClass?: string,
    closedEyeIconClass?: string,
    configDiff?: TConfigDiff,
    unNamedType?: string,
    stopNestingType?: string,
    forceBranchType?: string,
    forceLeafType?: string | string[],
    getNodeName?: (model: any) => string,
    showToolbar?: boolean
};

export default class TreeEditor {
    configDiff: TConfigDiff;
    model: any;
    constructor(options: TTreeEditorOptions) {
        _.defaults(options, defaultOptions);
        this.configDiff = options.configDiff;
        this.model = options.model;

        const reqres = Backbone.Radio.channel(_.uniqueId('treeEditor'));

        this.controller = new TreeDiffController({ configDiff: this.configDiff, graphModel: this.model, reqres });

        const popoutView = Core.dropdown.factory.createPopout({
            buttonView: TEButtonView,
            buttonViewOptions: {
                iconClass: options.eyeIconClass
            },

            panelView: NodeViewFactory.getRootView({
                model: this.model,
                unNamedType: options.unNamedType,
                stopNestingType: options.stopNestingType,
                forceBranchType: options.forceBranchType,
                forceLeafType: options.forceLeafType,
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

        popoutView.getDiffConfig = this.__getDiffConfig.bind(this);
        popoutView.setDiffConfig = this.__setDiffConfig.bind(this);
        popoutView.resetDiffConfig = this.__resetDiffConfig.bind(this);
        popoutView.reorderCollectionByIndex = TreeDiffController.prototype.__reorderCollectionByIndex; // Or should we export controller with coreApi?

        return (this.view = popoutView);
    }

    __getDiffConfig() {
        return this.controller.configDiff;
    }

    __setDiffConfig(configDiff) {
        this.controller.set(configDiff);
    }

    __resetDiffConfig() {
        this.controller.reset();
    }

    __onSave() {
        this.view.trigger('save', this.__getDiffConfig());
    }

    __onReset() {
        this.__resetDiffConfig();
        this.view.trigger('reset');
    }

    __commandExecute(actionModel: { id: string }) {
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
