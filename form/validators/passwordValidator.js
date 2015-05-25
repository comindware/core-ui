define(['module/lib'], function() {
    'use strict';

    Backbone.Form.validators.errMessages.password = Localizer.get('PROJECT.COMMON.FORM.VALIDATION.PASSWORD');

    Backbone.Form.validators.password = function(options) {
        options = _.extend({
            type: 'length',
            message: Backbone.Form.validators.errMessages.password,
            min: 8
        }, options);

        return Backbone.Form.validators.length(options);
    };
});
