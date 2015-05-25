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
            if (value === null || value === undefined || value === false || value === '') {
                return err;
            }
            if (_.isArray(value) && value.length === 0) {
                return err;
            }
        };
    };
});