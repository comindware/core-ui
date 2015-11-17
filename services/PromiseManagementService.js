define(['module/lib', './PromiseConfig'], function () {
    'use strict';

    var promiseQueue = {};

    return {
        addPromise: function(promise) {
            var promiseId = performance === undefined ? (new Date().getTime() + Math.random()) : performance.now();
            promiseQueue[promiseId] = promise;

            promise.then(function() {
                delete promiseQueue[promiseId];
            }).catch(function (e) {
                delete promiseQueue[promiseId];
                throw e;
            }).finally(function() {
                if (promise.isCancelled()) {
                    delete promiseQueue[promiseId];
                }
            });
            return promiseId;
        },

        clearPromiseQueue: function() {
            _.each(promiseQueue, function(promise) {
                promise.cancel();
            });
        }
    };
});