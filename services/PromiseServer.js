define(['module/lib', './promise/Config'], function() {
    'use strict';

    var promiseQueue = [];

    return {
        registerPromise: function(promise) {
            promiseQueue.push(promise);

            return promise.finally(function() {
                delete promiseQueue.splice(promiseQueue.indexOf(promise), 1);
            });
        },

        cancelAll: function() {
            _.each(promiseQueue, function(promise) {
                promise.cancel();
            });
        }
    };
});