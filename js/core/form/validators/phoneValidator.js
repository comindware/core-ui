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

define(['core/libApi', 'core/services/LocalizationService'], function (lib, LocalizationService) {
    'use strict';
    
    Backbone.Form.validators.errMessages.phone = LocalizationService.get('CORE.FORM.VALIDATION.PHONE');

    Backbone.Form.validators.phone = function (options) {
        options = _.extend({
            type: 'phone',
            message: Backbone.Form.validators.errMessages.phone,
            regexp: /^\+?[0-9]+[0-9\-().\s]{7,}$/
        }, options);

        return Backbone.Form.validators.regexp(options);
    };
});
