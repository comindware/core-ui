import TEButtonView from './views/TEButtonView';
import NodeViewFactory from './services/NodeViewFactory';
import DiffController from './controllers/DiffController';
import { TTreeEditorOptions, GraphModel } from './types';
import ConfigDiff from './classes/ConfigDiff';
import Backbone from 'backbone';
import _ from 'underscore';

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
    options: TTreeEditorOptions;
    configDiff: ConfigDiff;
    model: GraphModel;
    view: Marionette.View<Backbone.Model>;
    reqres: Backbone.Radio.Channel;
    controller: DiffController;

    constructor(options: TTreeEditorOptions) {
        _.defaults(options, defaultOptions);
        this.configDiff = options.configDiff;
        this.model = options.model;
        this.options = options;

        const reqres = this.reqres = Backbone.Radio.channel(_.uniqueId('treeEditor'));
        const nestingOptions = options.nestingOptions;
        this.controller = new DiffController({
            configDiff: this.configDiff,
            graphModel: this.model,
            initialModel: options.initialModel,
            calculateDiff: options.calculateDiff,
            reqres,
            nestingOptions
        });
    }

    getView() {
        const options = this.options;
        const reqres = this.reqres;
        const nestingOptions = options.nestingOptions;
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

        return this.view;
    }

    destroy() {
        if (this.view) {
            this.view.destroy();
        }
    }

    applyModelToDiff(properties: string[]) {
        this.controller.applyModelToDiff(properties);
    }

    applyDiffToModel(properties: string[]) {
        this.controller.applyDiffToModel(properties);
    }

    applyInitialConfigToModel(properties: string[]) {
        this.controller.applyInitialConfigToModel(properties);
    }

    getRootCollection() {
        return this.model.childrenAttribute ? this.model.get(this.model.childrenAttribute) : undefined;
    }

    getConfigDiff() {
        return this.controller.configDiff.__mapChildsToObjects();
    }

    setConfigDiff(configDiff: ConfigDiff) {
        this.controller.set(configDiff);
    }

    setInitConfig(initConfig: ConfigDiff) {
        this.controller.setInitConfig(initConfig);
    }

    resetConfigDiff(properties: string[] | void) {
        this.controller.reset(properties);
        this.view.trigger('reset');
    }

    __onSave() {
        this.view.trigger('save', this.getConfigDiff());
    }

    __onReset() {
        this.resetConfigDiff();
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
