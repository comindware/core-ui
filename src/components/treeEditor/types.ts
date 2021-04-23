import DiffItem from './classes/DiffItem';
import ConfigDiff from './classes/ConfigDiff';

export interface GraphModel extends Backbone.Model {
    isContainer?: boolean;
    childrenAttribute?: string;
    getParent?: () => GraphModel;
    getChildren: () => GraphModel;
    findAllDescendants?: (predicate?: (graphModel: GraphModel) => boolean) => GraphModel[];
}

export interface ParentModel extends Backbone.Model {
    isContainer: boolean;
    childrenAttribute: string;
    getParent: () => GraphModel;
    getChildren: () => GraphModel;
    findAllDescendants?: () => GraphModel[];
}

type StringOrArray = string | string[];

export type NestingOptions = {
    stopNestingType?: StringOrArray,
    forceBranchType?: StringOrArray,
    forceLeafType?: StringOrArray,
    hasControllerType?: StringOrArray,
}

export type TTreeEditorOptions = {
    model: GraphModel,
    initialModel: GraphModel,
    calculateDiff: boolean,
    hidden?: boolean,
    eyeIconClass?: string,
    closedEyeIconClass?: string,
    configDiff: ConfigDiff,
    unNamedType?: string,
    nestingOptions?: NestingOptions,
    getNodeName?: (model: GraphModel) => string,
    showToolbar?: boolean,
    showResetButton?: boolean
};

export type ChildsFilter = (argument: { model: Backbone.Model }) => boolean;

export type NodeViewFactoryOptions = {
    model: ParentModel | Backbone.Model,
    unNamedType?: string | string[],
    nestingOptions?: NestingOptions,
    childsFilter?: ChildsFilter
};

export interface RootViewFactoryOptions extends NodeViewFactoryOptions {
    showToolbar?: boolean;
    showResetButton?: boolean;
}

export type SingleItem = boolean | number | string;

export type NodeConfig = { [prop: string]: SingleItem };

export type TreeConfig = Map<string, DiffItem>;
