define(['module/lib'],
    function() {
        'use strict';

        //Wraps Backbone jQuery promises for model operations with Bluebird promises and makes them cancellable

        var BluebirdModelBehavior = function(model) {
            this.__model = model;
        };

        _.extend(BluebirdModelBehavior.prototype, {
            save: function() {
                var $saveXhr = this.__model.save.apply(this.__model, arguments);
                return Promise.resolve($saveXhr)
                    .cancellable()
                    .catch(Promise.CancellationError, function() {
                        $saveXhr.abort();
                    });
            },

            fetch: function() {
                var $fetchXhr = this.__model.fetch.apply(this.__model, arguments);
                return Promise.resolve($fetchXhr)
                    .cancellable()
                    .catch(Promise.CancellationError, function() {
                        $fetchXhr.abort();
                    });;
            },

            destroy: function() {
                var $destroyXhr = this.__model.destroy.apply(this.__model, arguments);
                return Promise.resolve($destroyXhr)
                    .cancellable()
                    .catch(Promise.CancellationError, function() {
                        $destroyXhr.abort();
                    });;
            }
        });

        return BluebirdModelBehavior;
    });