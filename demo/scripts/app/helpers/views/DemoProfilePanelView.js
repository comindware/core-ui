/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/demoProfilePanel.html'],
    function (template) {
        'use strict';
        return Marionette.ItemView.extend({
            className: 'nav-profile_test',

            template: Handlebars.compile(template)
        });
    });
