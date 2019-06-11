import BranchView from '../views/BranchView';
import LeafView from '../views/LeafView';
import EmptyView from '../views/EmptyView';
import UnNamedBranchView from '../views/UnNamedBranchView';

export default {
    getNodeView(config: { model: any, unNamedType?: string, stopNestingType?: string, forceBranchType?: string }) {
        const { model, unNamedType, stopNestingType, forceBranchType } = config;
        const isBranchView = (forceBranchType && model.get('type') === forceBranchType) || (!stopNestingType || model.getParent()?.get('type') !== stopNestingType);

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
