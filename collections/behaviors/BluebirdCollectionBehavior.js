define(['module/lib'],
    function() {
        'use strict';

        var BluebirdCollectionBehavior = function(collection) {
            this.__collection = collection;
        };

        _.extend(BluebirdCollectionBehavior.prototype, {
            fetch: function() {
                return Promise.resolve(this.__collection.fetch.apply(this.__collection, arguments));
            }
        });

        return BluebirdCollectionBehavior;
    });