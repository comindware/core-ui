import SelectStateItemsCollection from '../collections/SelectStateItemsCollection';
import meta from '../meta';

export default Backbone.Model.extend({
    initialize() {
        const items = this.get('items');
        const itemsCollection = new SelectStateItemsCollection(items);
        this.listenTo(itemsCollection, 'select:one', model => this.set('iconClass', model.get('iconClass')));
        this.set('items', itemsCollection);

        this.__selectDefaultModel(itemsCollection);
        this.__addDropdownClass();
    },

    __addDropdownClass() {
        const dropdownClass = this.get('dropdownClass');
        let SelectStateDropdownClass = 'toolbar-panel_container__select-state';
        dropdownClass && (SelectStateDropdownClass = `${dropdownClass} ${SelectStateDropdownClass}`);
        this.set('dropdownClass', SelectStateDropdownClass);
    },

    __selectDefaultModel(itemsCollection) {
        let firstNotHeadlineModel = null;

        firstNotHeadlineModel = itemsCollection.find(model => model.get('type') !== meta.toolbarItemType.HEADLINE && model.get('default'));

        if (!firstNotHeadlineModel) {
            firstNotHeadlineModel = itemsCollection.find(model => model.get('type') !== meta.toolbarItemType.HEADLINE);
        }

        itemsCollection.select(firstNotHeadlineModel);
    }
});
