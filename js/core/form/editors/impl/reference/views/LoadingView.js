/**
 * Developer: Stepan Burguchev
 * Date: 11/18/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
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
