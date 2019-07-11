import TEButtonView from './views/TEButtonView';
import NodeViewFactory from './services/NodeViewFactory';

const defaultOptions = {
    eyeIconClass: 'eye',
    closedEyeIconClass: 'eye-slash',
    configDiff: {},
    getNodeName: undefined
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
    getNodeName?: (model: any) => string
};

export default class TreeEditor {
    configDiff: TConfigDiff;
    oldConfigDiff: TConfigDiff;
    model: any;
    constructor(options: TTreeEditorOptions) {
        _.defaults(options, defaultOptions);
        this.configDiff = options.configDiff;
        this.oldConfigDiff = options.configDiff;
        this.model = options.model;

        const reqres = Backbone.Radio.channel(_.uniqueId('treeEditor'));

        const popoutView = Core.dropdown.factory.createPopout({
            buttonView: TEButtonView,
            buttonViewOptions: {
                iconClass: options.eyeIconClass
            },

            panelView: NodeViewFactory.getRootView({
                model: this.model,
                unNamedType: options.unNamedType,
                stopNestingType: options.stopNestingType,
                forceBranchType: options.forceBranchType
            }),
            panelViewOptions: {
                ...options,
                reqres,
                maxWidth: 300
            }
        });

        reqres.reply('treeEditor:setWidgetConfig', (id, config) => this.applyConfigDiff(id, config));
        reqres.reply('treeEditor:resize', () => popoutView.adjustPosition());
        popoutView.listenTo(popoutView, 'close', () => this.__onSave(popoutView));

        if (options.hidden) {
            popoutView.el.setAttribute('hidden', true);
        }

        return popoutView;
    }

    applyConfigDiff(id: string, config: TConfigDiff) {
        if (this.configDiff[id]) {
            Object.assign(this.configDiff[id], config);
        } else {
            this.configDiff[id] = config;
        }
    }

    __onSave(popoutView) {
        popoutView.trigger('save', this.configDiff);
    }
}
