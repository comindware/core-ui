define(['module/lib'],
    function() {
        'use strict';

        //Wraps Backbone jQuery promises for model operations with Bluebird promises and makes them cancellable

        var BluebirdCollectionBehavior = function(collection) {
            this.__oldFetch = collection.fetch;
        };

        _.extend(BluebirdCollectionBehavior.prototype, {
            fetch: function() {
                var $fetchXhr = this.__oldFetch.apply(this, arguments);
                return Promise.resolve($fetchXhr)
                    .cancellable()
                    .catch(Promise.CancellationError, function() {
                        $fetchXhr.abort();
                    });
            }
        });

        return BluebirdCollectionBehavior;
    });