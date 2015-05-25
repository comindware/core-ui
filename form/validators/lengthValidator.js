define(['module/lib'], function () {
    'use strict';

    Backbone.Form.validators.errMessages.length = Localizer.get('PROJECT.COMMON.FORM.VALIDATION.LENGTH');

    Backbone.Form.validators.length = function(options) {
        options = _.extend({
            type: 'length',
            message: Backbone.Form.validators.errMessages.length
        }, options);

        return function length(value) {
            options.value = value;
            var err = {
                type: options.type,
                message: _.isFunction(options.message) ? options.message(options) : options.message
            };
            //Don't check empty values (add a 'required' validator for this)
            if (value === null || value === undefined || value === '') return;

            if (options.min) {
                if (value.length < options.min) {
                    return err;
                }
            }
            if (options.max) {
                if (value.length > options.max) {
                    return err;
                }
            }
        };
    };
});
