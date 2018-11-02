import SelectStateItemsCollection from '../collections/SelectStateItemsCollection';
import meta from '../meta';

export default Backbone.Model.extend({
    initialize() {
        const items = this.get('items');
        const itemsCollection = new SelectStateItemsCollection(items);
        this.listenTo(itemsCollection, 'select:one', model => this.set('iconClass', model.get('iconClass')));
        this.set('items', itemsCollection);
        const firstNotHeadlineModel = _.first(itemsCollection.filter(model => model.get('type') !== meta.toolbarItemType.HEADLINE));
        itemsCollection.select(firstNotHeadlineModel);
    },

    defaults: {
        dropdownClass: 'toolbar-panel_container__select-state'
    }
});
