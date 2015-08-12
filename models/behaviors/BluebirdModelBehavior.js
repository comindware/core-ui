define(['module/lib'],
    function() {
        'use strict';

        var BluebirdModelBehavior = function (model) {
            this.__model = model;
        };

        _.extend(BluebirdModelBehavior.prototype, {
            save: function() {
                return Promise.resolve(this.__model.save.apply(this.__model, arguments));
            },

            fetch: function() {
                return Promise.resolve(this.__model.fetch.apply(this.__model, arguments));
            },

            destroy: function() {
                return Promise.resolve(this.__model.destroy.apply(this.__model, arguments));
            }
        });

        return BluebirdModelBehavior;
    });