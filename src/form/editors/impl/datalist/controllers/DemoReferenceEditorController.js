import list from 'list';
import DefaultReferenceModel from '../models/DefaultReferenceModel';

const createDemoData = function () {
    return _.times(1000, i => {
        const id = `task.${i + 1}`;
        return {
            id,
            text: `Test Reference ${i}`
        };
    });
};

const DemoReferenceCollections = Backbone.Collection.extend({
    model: DefaultReferenceModel
});

export default Marionette.Object.extend({
    initialize() {
        this.collection = list.factory.createWrappedCollection({ collection: new DemoReferenceCollections([]) });
    },

    fetch(options = {}) {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (promise !== this.fetchPromise) {
                    reject();
                    return;
                }

                this.collection.reset(createDemoData());
                if (options.text) {
                    const filterText = options.text.trim().toUpperCase();
                    if (filterText) {
                        this.collection.filter(model => {
                            const text = model.get('text');
                            if (!text) {
                                return false;
                            }
                            return text.toUpperCase().indexOf(filterText) !== -1;
                        });
                    } else {
                        this.collection.filter(null);
                    }
                } else {
                    this.collection.filter(null);
                }

                this.totalCount = 1001;
                resolve({
                    collection: this.collection.toJSON(),
                    totalCount: this.totalCount
                });
                this.fetchPromise = null;
            }, 1000);
        });
        this.fetchPromise = promise;
        return promise;
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
