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

define(['module/lib'], function (lib) {
    'use strict';

    Backbone.Form.validators.errMessages.letters = Localizer.get('PROJECT.COMMON.FORM.VALIDATION.LETTERS');

    Backbone.Form.validators.letters = function (options) {
        options = _.extend({
            type: 'letters',
            message: Backbone.Form.validators.errMessages.letters,
            regexp: lib.XRegExp('^[\\p{L}-]+$')
        }, options);

        return Backbone.Form.validators.regexp(options);
    };
});
