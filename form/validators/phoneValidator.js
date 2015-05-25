define(['module/lib'], function () {
    'use strict';
    
    Backbone.Form.validators.errMessages.phone = Localizer.get('PROJECT.COMMON.FORM.VALIDATION.PHONE');

    Backbone.Form.validators.phone = function (options) {
        options = _.extend({
            type: 'phone',
            message: Backbone.Form.validators.errMessages.phone,
            regexp: /^\+?[0-9]+[0-9\-().\s]{7,}$/
        }, options);

        return Backbone.Form.validators.regexp(options);
    };
});
