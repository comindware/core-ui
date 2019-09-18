const events = {
    LOADING: 'loading'
};

export default {
    canceledPromises: [],

    promiseQueue: [],

    listeners: {
        [events.LOADING]: []
    },

    async registerPromise(promise, isNeedCheckBeforeLeave) {
        promise.id = _.uniqueId('promise_');
        promise.isNeedCheckBeforeLeave = isNeedCheckBeforeLeave;
        this.__addToQueue(promise);
        try {
            const rejectPromise = new Promise((resolve, reject) => {
                promise.reject = reject;
            });

            return await Promise.race([promise, rejectPromise]);
        } finally {
            this.__removeFromQueue(promise);
        }
    },

    cancelAll() {
        this.promiseQueue.forEach(promise => {
            promise.reject({ isCanceled: true });
        });
    },

    checkBeforeLeave() {
        return this.promiseQueue.some(promise => promise.isNeedCheckBeforeLeave);
    },

    addListener(event, callback) {
        switch (event) {
            case events.LOADING:
                this.listeners[event].push(callback);
                break;
            default:
                Core.InterfaceError.logError(`Unexpected event "${event}" for Promise Service`);
                break;
        }
    },

    __addToQueue(promise) {
        if (promise.isNeedCheckBeforeLeave && !this.checkBeforeLeave()) {
            this.__trigger(events.LOADING, true);
        }
        this.promiseQueue.push(promise);
    },

    __removeFromQueue(promise) {
        delete this.promiseQueue.splice(this.promiseQueue.findIndex(cP => cP.id === promise.id), 1);
        // TODO where push to this.canceledPromises ?
        delete this.canceledPromises.splice(this.promiseQueue.findIndex(cP => cP.id === promise.id), 1);

        if (promise.isNeedCheckBeforeLeave && !this.checkBeforeLeave()) {
            this.__trigger(events.LOADING, false);
        }
    },

    __trigger(event, ...args) {
        this.listeners[event].forEach(callback => callback(...args));
    }
};
