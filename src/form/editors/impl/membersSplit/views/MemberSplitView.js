
import ItemSplitView from '../../splitEditor/view/ItemSplitView';
import MembersListItemView from './MembersListItemView';
import MembersToolbarView from './membersToolbarView';

export default ItemSplitView.extend({
    options() {
        return {
            maxQuantityText: Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.MAXQUANTITY'),
            itemsToolbarView: MembersToolbarView,
            itemListItemView: MembersListItemView
        };
    }
});
