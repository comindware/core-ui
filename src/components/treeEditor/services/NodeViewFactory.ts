import BranchView from '../views/BranchView';
import RootView from '../views/RootView';
import LeafView from '../views/LeafView';
import EmptyView from '../views/EmptyView';
import UnNamedBranchView from '../views/UnNamedBranchView';

export default {
    getRootView(config: { model: any, unNamedType?: string, stopNestingType?: string, forceBranchType?: string }) {
        return RootView;
    },

    getNodeView(config: { model: any, unNamedType?: string, stopNestingType?: string, forceBranchType?: string }) {
        const { model, unNamedType, stopNestingType, forceBranchType } = config;
        const isForcedBranch = forceBranchType && model.get('type') === forceBranchType;
        const isStopNestingType = !stopNestingType || model.getParent()?.get('type') !== stopNestingType;
        const isBranchView = isForcedBranch || isStopNestingType;

        if (model.isContainer) {
            const collection = model.get(model.childrenAttribute);
            if (!collection.length) {
                return EmptyView;
            }

            if (unNamedType && model.get('type') === unNamedType) {
                return UnNamedBranchView;
            }

            if (isBranchView) {
                return BranchView;
            }
        }

        return LeafView;
    }
};
