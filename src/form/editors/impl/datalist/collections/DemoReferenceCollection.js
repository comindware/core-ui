import DefaultReferenceModel from '../models/DefaultReferenceModel';

const createDemoData = function () {
    return _.times(1000, i => {
        const id = `task.${i}`;
        return {
            id,
            text: `Test Reference ${i}`
        };
    });
};

const fetchDelay = 150;

export default Backbone.Collection.extend({
    initialize(models, options = {}) {
        this.__maxFetchedQuantity = options.maxFetchedQuantity || 50;
        this.__inilialModels = models || createDemoData();
        this.__fetchDelay = options.fetchDelay || fetchDelay;
    },
    
    model: DefaultReferenceModel,

    fetch({ data: { filter } }) {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (promise !== this.fetchPromise) {
                    reject();
                    return;
                }

                const filteredModels = this.__inilialModels
                .filter(attrubutes => 
                    String(attrubutes.text || attrubutes.name || attrubutes.id).includes(filter)
                );
                this.totalCount = filteredModels.length;

                this.reset(
                    filteredModels.slice(0, this.__maxFetchedQuantity)
                );
 
                this.trigger('sync');
                resolve();
                this.fetchPromise = null;
            }, this.__fetchDelay);
        });
        this.fetchPromise = promise;
        return promise;
    }
});
