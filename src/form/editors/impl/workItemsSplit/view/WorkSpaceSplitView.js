//@flow
import ItemSplitView from '../../splitEditor/view/ItemSplitView';
import WorkSpaceItemView from './WorkSpaceItemView';
import WorkSpaceGroupView from './WorkSpaceGroupView';
import ItemModel from '../../splitEditor/model/ItemModel';

export default ItemSplitView.extend({
    options: {
        itemListItemView: WorkSpaceItemView,
        childViewSelector(model) {
            if (model instanceof ItemModel) {
                return WorkSpaceItemView;
            }

            return WorkSpaceGroupView;
        }
    }
});
