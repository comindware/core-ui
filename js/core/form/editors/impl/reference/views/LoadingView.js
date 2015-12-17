/**
 * Developer: Stepan Burguchev
 * Date: 11/18/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/loading.html', 'core/libApi'],
    function (template, lib) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function () {
            },

            className: 'l-loader',

            template: Handlebars.compile(template)
        });
    });
