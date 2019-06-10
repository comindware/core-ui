import BranchView from '../views/BranchView';
import LeafView from '../views/LeafView';
import EmptyView from '../views/EmptyView';
import UnNamedBranchView from '../views/UnNamedBranchView';

export default {
    getNodeView(model: any, unNamedType?: string) {
        if (model.isContainer) {
            const collection = model.get(model.childrenAttribute);
            if (!collection.length) {
                return EmptyView;
            }

            if (unNamedType && model.get('type') === unNamedType) {
                return UnNamedBranchView;
            }

            return BranchView;
        }

        return LeafView;
    }
};
