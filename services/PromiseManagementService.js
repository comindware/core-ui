define(['module/lib', './PromiseConfig'], function () {
    'use strict';

    var promiseQuque = {};

    return {
        addPromise: function(promise) {
            var promiseId = performance === undefined ? (new Date().getTime() + Math.random()) : performance.now();
            promiseQuque[promiseId] = promise;

            promise.then(function() {
                delete promiseQuque[promiseId];
            }).catch(function (e) {
                delete promiseQuque[promiseId];
                throw e;
            }).finally(function() {
                if (promise.isCancelled()) {
                    delete promiseQuque[promiseId];
                }
            });
            return promiseId;
        },

        clearPromiseQueue: function() {
            _.each(promiseQuque, function(promise) {
                promise.cancel();
            });
        }
    };
});