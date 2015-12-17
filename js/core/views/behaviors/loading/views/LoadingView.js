/**
 * Developer: Ksenia Kartvelishvili
 * Date: 29.06.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
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
