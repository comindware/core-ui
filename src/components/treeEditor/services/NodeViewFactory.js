import BranchView from '../views/BranchView';
import LeafView from '../views/LeafView';

export default {
    getNodeView(model) {
        if (model.isContainer) {
            return BranchView;
        }

        return LeafView;
    }
};
