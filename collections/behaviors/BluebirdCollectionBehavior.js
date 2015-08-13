define(['module/lib'],
    function() {
        'use strict';

        //Wraps Backbone jQuery promises for model operations with Bluebird promises and makes them cancellable

        var BluebirdCollectionBehavior = function(collection) {
            this.__collection = collection;
        };

        _.extend(BluebirdCollectionBehavior.prototype, {
            fetch: function() {
                var $fetchXhr = this.__collection.fetch.apply(this.__collection, arguments);
                return Promise.resolve($fetchXhr)
                    .cancellable()
                    .catch(Promise.CancellationError, function() {
                        $fetchXhr.abort();
                    });
            }
        });

        return BluebirdCollectionBehavior;
    });