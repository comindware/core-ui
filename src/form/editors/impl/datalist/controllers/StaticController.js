// @flow
import BaseReferenceEditorController from '../../reference/controllers/BaseReferenceEditorController';

export default BaseReferenceEditorController.extend({
    fetch(options = {}) {
        const promise = new Promise(resolve => {
            if (options.text) {
                const filterText = options.text.trim().toUpperCase();
                if (filterText) {
                    this.collection.filter(model => {
                        const text = model.get('text') || model.get(this.options.displayAttribute);
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

            this.totalCount = this.collection.length;

            return resolve({
                collection: this.collection.toJSON(),
                totalCount: this.totalCount
            });
        });

        return promise;
    }
});
