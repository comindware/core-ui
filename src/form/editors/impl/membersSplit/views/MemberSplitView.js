import ItemSplitView from '../../splitEditor/view/ItemSplitView';
import MembersListItemView from './MembersListItemView';
import MembersToolbarView from './membersToolbarView';
import LocalizationService from '../../../../../services/LocalizationService';

export default ItemSplitView.extend({
    options() {
        return {
            maxQuantityText: LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.MAXQUANTITY'),
            itemsToolbarView: MembersToolbarView,
            itemListItemView: MembersListItemView
        };
    }
});
