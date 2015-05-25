/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

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
