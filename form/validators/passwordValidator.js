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

define(['core/libApi', 'core/services/LocalizationService'], function(lib, LocalizationService) {
    'use strict';

    Backbone.Form.validators.errMessages.password = LocalizationService.get('CORE.FORM.VALIDATION.PASSWORD');

    Backbone.Form.validators.password = function(options) {
        options = _.extend({
            type: 'length',
            message: Backbone.Form.validators.errMessages.password,
            min: 8
        }, options);

        return Backbone.Form.validators.length(options);
    };
});
