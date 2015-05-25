define(['module/lib'], function () {
    'use strict';

    Backbone.Form.validators.errMessages.letters = Localizer.get('PROJECT.COMMON.FORM.VALIDATION.LETTERS');

    Backbone.Form.validators.letters = function (options) {
        options = _.extend({
            type: 'letters',
            message: Backbone.Form.validators.errMessages.letters,
            regexp: XRegExp('^[\\p{L}-]+$')
        }, options);

        return Backbone.Form.validators.regexp(options);
    };
});
