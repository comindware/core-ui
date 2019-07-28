import DiffItem from './classes/DiffItem';

export interface GraphModel extends Backbone.Model {
    isContainer?: boolean;
    childrenAttribute?: string;
    getParent?: () => GraphModel;
    getChildren: () => GraphModel;
    findAllDescendants?: () => GraphModel[];
}

export interface ParentModel extends Backbone.Model {
    isContainer: boolean;
    childrenAttribute: string;
    getParent: () => GraphModel;
    getChildren: () => GraphModel;
    findAllDescendants?: () => GraphModel[];
}

export type TTreeEditorOptions = {
    model: any,
    hidden?: boolean,
    eyeIconClass?: string,
    closedEyeIconClass?: string,
    configDiff: TConfigDiff,
    unNamedType?: string,
    stopNestingType?: string,
    forceBranchType?: string,
    forceLeafType?: string | string[],
    getNodeName?: (model: GraphModel) => string,
    showToolbar?: boolean
};

export type ChildsFilter = (argument: Backbone.View) => boolean;

export type NodeViewFactoryOptions = {
    model: ParentModel | Backbone.Model,
    unNamedType?: string | string[],
    stopNestingType?: string | string[],
    forceBranchType?: string | string[],
    forceLeafType?: string | string[],
    childsFilter?: ChildsFilter
};

export interface RootViewFactoryOptions extends NodeViewFactoryOptions {
    showToolbar?: boolean;
}

export type TConfigDiff = Map<string, NodeConfig>;

export type SingleItem = boolean | number | string;

export type NodeConfig = { [prop: string]: SingleItem };

export type TreeConfig = Map<string, DiffItem>;
