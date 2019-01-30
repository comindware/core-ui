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

export default Backbone.Collection.extend({
    model: DefaultReferenceModel,

    fetch({ data: { filter } }) {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (promise !== this.fetchPromise) {
                    reject();
                    return;
                }

                this.reset(
                    createDemoData()
                        .filter(attrubutes => 
                            attrubutes.text.includes(filter)
                        )
                );
 
                this.trigger('sync');
                resolve();
                this.fetchPromise = null;
            }, 700);
        });
        this.fetchPromise = promise;
        return promise;
    }
});
