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

define(['module/lib', 'core/services/LocalizationService'], function (lib, LocalizationService) {
    'use strict';

    Backbone.Form.validators.errMessages.length = LocalizationService.get('CORE.FORM.VALIDATION.LENGTH');

    Backbone.Form.validators.length = function(options) {
        options = _.extend({
            type: 'length',
            message: Backbone.Form.validators.errMessages.length
        }, options);

        return function length(value) {

            var val = _.isObject(value) ? value.value : value;
            options.value = val;
            var err = {
                type: options.type,
                message: _.isFunction(options.message) ? options.message(options) : options.message
            };
            //Don't check empty values (add a 'required' validator for this)
            if (val === null || val === undefined || val === '') return;

            if (options.min) {
                if (val.length < options.min) {
                    return err;
                }
            }
            if (options.max) {
                if (val.length > options.max) {
                    return err;
                }
            }
        };
    };
});
