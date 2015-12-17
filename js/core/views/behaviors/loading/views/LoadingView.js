/**
 * Developer: Ksenia Kartvelishvili
 * Date: 29.06.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['core/libApi', 'text!../templates/loading.html'],
    function (lib, template) {
        'use strict';
        return Marionette.ItemView.extend({
            templateHelpers: function () {
                return {
                    text: this.options.text
                };
            },

            template: Handlebars.compile(template),

            className: 'l-loader'
        });
    });
