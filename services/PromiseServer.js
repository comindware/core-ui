define(['module/lib', './promise/Config'], function () {
    'use strict';

    var promiseQueue = [];

    return {
        registerPromise: function (promise) {
            promiseQueue.push(promise);

            promise.then(function() {
                delete promiseQueue.splice(promiseQueue.indexOf(promise), 1);
            }).catch(function (e) {
                delete promiseQueue.splice(promiseQueue.indexOf(promise), 1);
                throw e;
            }).finally(function() {
                if (promise.isCancelled()) {
                    delete promiseQueue.splice(promiseQueue.indexOf(promise), 1);
                }
            });
        },

        cancelAll: function () {
            _.each(promiseQueue, function(promise) {
                promise.cancel();
            });
        }
    };
});