import BranchView from '../views/BranchView';
import LeafView from '../views/LeafView';
import EmptyView from '../views/EmptyView';
import UnNamedBranchView from '../views/UnNamedBranchView';

export default {
    getNodeView(config: { model: any, unNamedType?: string, stopNestingType?: string }) {
        const { model, unNamedType, stopNestingType } = config;
        const isBranchView = cfg => !cfg.stopNestingType || cfg.model.getParent()?.get('type') !== cfg.stopNestingType;

        if (model.isContainer) {
            const collection = model.get(model.childrenAttribute);
            if (!collection.length) {
                return EmptyView;
            }

            if (unNamedType && model.get('type') === unNamedType) {
                return UnNamedBranchView;
            }

            if (isBranchView(config)) {
                return BranchView;
            }
        }

        return LeafView;
    }
};
