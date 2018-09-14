// @flow
import BaseReferenceEditorController from './BaseReferenceEditorController';

export default BaseReferenceEditorController.extend({
    fetch(options = {}) {
        const promise = new Promise(resolve => {
            if (options.text && options.getDisplayText) {
                const filterText = options.text.trim().toUpperCase();
                if (filterText) {
                    this.collection.filter(model => {
                        const text = options.getDisplayText(model.attributes);
                        if (!text) {
                            return false;
                        }
                        return String(text).toUpperCase().includes(filterText);
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
