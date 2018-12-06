export default {
    canceledPromises: [],

    promiseQueue: [],

    async registerPromise(promise, isNeedCheckBeforeLeave) {
        promise.id = _.uniqueId('promise_');
        promise.isNeedCheckBeforeLeave = isNeedCheckBeforeLeave;
        this.promiseQueue.push(promise);
        try {
            const rejectPromise = new Promise((resolve, reject) => {
                promise.reject = reject;
            });

            return await Promise.race([promise, rejectPromise]);
        } finally {
            delete this.promiseQueue.splice(this.promiseQueue.findIndex(cP => cP.id === promise.id), 1);
            delete this.canceledPromises.splice(this.promiseQueue.findIndex(cP => cP.id === promise.id), 1);
        }
    },

    cancelAll() {
        this.promiseQueue.forEach(promise => {
            promise.reject({ isCanceled: true });
        });
    },

    checkBeforeLeave() {
        return this.promiseQueue.some(promise => promise.isNeedCheckBeforeLeave);
    }
};
