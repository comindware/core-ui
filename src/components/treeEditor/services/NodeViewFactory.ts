import BranchView from '../views/BranchView';
import RootView from '../views/RootView';
import RootViewWithToolbar from '../views/RootViewWithToolbar';
import LeafView from '../views/LeafView';
import EmptyView from '../views/EmptyView';
import UnNamedBranchView from '../views/UnNamedBranchView';

export default {
    getRootView(config: {
        model: any,
        unNamedType?: string,
        stopNestingType?: string,
        forceBranchType?: string,
        forceLeafType?: string | string[],
        showToolbar?: boolean,
        childsFilter?: any
    }) {
        if (config.showToolbar) {
            return RootViewWithToolbar;
        }

        return RootView;
    },

    getNodeView(config: { model: any, unNamedType?: string, stopNestingType?: string, forceBranchType?: string, forceLeafType?: string | string[], childsFilter?: any }) {
        const { model, unNamedType, stopNestingType, forceBranchType, forceLeafType, childsFilter } = config;
        const type = model.get('type');
        const fieldType = model.get('fieldType');
        const isForcedBranch = forceBranchType && Array.isArray(forceBranchType) ? forceBranchType.includes(type) : type === forceBranchType;
        const isForcedLeaf =
            forceLeafType &&
            (Array.isArray(forceLeafType) ? forceLeafType.includes(type) || forceLeafType.includes(fieldType) : type === forceLeafType || fieldType === forceLeafType);
        const nestingAllowed = !stopNestingType || model.getParent()?.get('type') !== stopNestingType; // TODO think about passing an optional getNodeView
        const isBranchView = isForcedBranch || nestingAllowed;

        if (!model.isContainer || isForcedLeaf) {
            return LeafView;
        }

        const collection = model.get(model.childrenAttribute);
        if (!collection.length) {
            return EmptyView;
        }

        if (unNamedType && type === unNamedType) {
            return UnNamedBranchView;
        }

        if (isBranchView) {
            return BranchView;
        }
    }
};
