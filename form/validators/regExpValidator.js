define(['module/lib'], function () {
    'use strict';

    var regExpOld = Backbone.Form.validators.regexp;

    Backbone.Form.validators.regexp = function (options) {
        return _.wrap(regExpOld(options), function (func, value) {
            var val = _.isObject(value) ? value.value : value;
            return func(val);
        });
    };
});
