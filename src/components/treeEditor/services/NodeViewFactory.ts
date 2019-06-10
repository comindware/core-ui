import BranchView from '../views/BranchView';
import LeafView from '../views/LeafView';
import EmptyView from '../views/EmptyView';

export default {
    getNodeView(model) {
        if (model.isContainer) {
            const collection = model.get(model.childrenAttribute);
            if (!collection.length) {
                return EmptyView;
            }

            return BranchView;
        }

        return LeafView;
    }
};
