define(['module/lib'], function () {
    'use strict';

    Backbone.Form.validators.errMessages.required = Localizer.get('PROJECT.COMMON.FORM.VALIDATION.REQUIRED');

    Backbone.Form.validators.required = function (options) {
        options = _.extend({
            type: 'required',
            message: this.errMessages.required
        }, options);

        return function required(value) {
            options.value = value;

            var err = {
                type: options.type,
                message: _.isFunction(options.message) ? options.message(options) : options.message
            };
            if (value === null || value === undefined || value === false || value === '') return err;
            if (_.isArray(value) && value.length === 0) return err;
        };
    };
});