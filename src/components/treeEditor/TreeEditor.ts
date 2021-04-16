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
    showResetButton: true,
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
        this.storageConfigDiff = options.configDiff;
        this.configDiff = options.configDiff;
        this.showPanelViewOnly = options.showPanelViewOnly;
        this.model = options.model;

        const reqres = Backbone.Radio.channel(_.uniqueId('treeEditor'));
        const nestingOptions = options.nestingOptions;
        this.controller = new DiffController({ configDiff: this.configDiff, graphModel: this.model, reqres, nestingOptions });

        if (this.showPanelViewOnly) {
            const View = NodeViewFactory.getRootView({
                model: this.model,
                unNamedType: options.unNamedType,
                nestingOptions,
                showToolbar: options.showToolbar,
                showResetButton: options.showResetButton
            });
            this.view = new View({
                ...options,
                reqres,
                maxWidth: 300
            });
        } else {
            this.view = Core.dropdown.factory.createPopout({
                buttonView: TEButtonView,
                buttonViewOptions: {
                    iconClass: options.eyeIconClass
                },

                panelView: NodeViewFactory.getRootView({
                    model: this.model,
                    unNamedType: options.unNamedType,
                    nestingOptions,
                    showToolbar: options.showToolbar,
                    showResetButton: options.showResetButton
                }),
                panelViewOptions: {
                    ...options,
                    reqres,
                    maxWidth: 300
                },
                showDropdownAnchor: false
            });
            reqres.reply('treeEditor:collapse', () => this.view.adjustPosition(false));
            this.view.listenTo(reqres, 'treeEditor:diffApplied', () => this.view.trigger('treeEditor:diffApplied'));

            this.view.once('attach', () => this.view.adjustPosition(false)); // TODO it doesn't work like this

            if (options.showToolbar) {
                reqres.reply('command:execute', actionModel => this.__commandExecute(actionModel));
            } else {
                this.view.listenTo(this.view, 'close', () => this.__onSave());
            }

            if (options.hidden) {
                this.view.el.setAttribute('hidden', true);
            }
        }

        this.view.getConfigDiff = this.__getConfigDiff.bind(this);
        this.view.setVisibleConfigDiffInit = this.__setVisibleConfigDiffInit.bind(this);
        this.view.setConfigDiff = this.__setConfigDiff.bind(this);
        this.view.resetConfigDiff = this.__resetConfigDiff.bind(this);
        this.view.setInitConfig = this.setInitConfig.bind(this);
        this.view.reorderCollectionByIndex = this.controller.__reorderCollectionByIndex;
        this.view.getRootCollection = this.__getRootCollection.bind(this);

        return this.view;
    }

    __setVisibleConfigDiffInit() {
        this.controller.setVisibleConfigDiffInit();
    }

    __getRootCollection() {
        return this.model.get(this.model.childrenAttribute);
    }

    __getConfigDiff() {
        return this.controller.configDiff.__mapChildsToObjects();
    }

    __setConfigDiff(configDiff: ConfigDiff) {
        this.controller.set(configDiff);
    }

    setInitConfig(initConfig: ConfigDiff) {
        this.controller.setInitConfig(initConfig);
    }

    __resetConfigDiff() {
        this.controller.reset();
        this.controller.setVisibleConfigDiffInit();
        this.view.trigger('reset');
    }

    __onSave() {
        this.view.trigger('save', this.__getConfigDiff());
    }

    __onReset() {
        this.__resetConfigDiff();
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
