import list from 'list';
import DemoReferenceCollections from '../collections/DemoReferenceCollection';

export default Marionette.MnObject.extend({
    initialize() {
        const collection = new DemoReferenceCollections([]);
        this.collection = list.factory.createWrappedCollection({ collection });
    },

    createValueUrl(value) {
        return `#example/${value.id}`;
    },

    edit() {
        return true;
    },

    addNewItem(callback) {
        callback({
            id: 'test.new',
            text: 'New Item'
        });
    }
});
