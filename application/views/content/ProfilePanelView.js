/**
 * Developer: Stepan Burguchev
 * Date: 7/8/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'module/lib',
    'core/services/ModuleService',
    'core/services/RoutingService',
    'text!../../templates/content/profilePanel.html'
], function (lib, ModuleService, RoutingService, template) {
    'use strict';
    return Marionette.ItemView.extend({
        initialize: function () {
        },

        className: 'dev-default-content-view__profile__panel',

        events: {
            'click .js-logout': '__logout'
        },

        template: Handlebars.compile(template),

        templateHelpers: function () {
            return {
                profileUrl: ModuleService.getModuleUrlByName('user', ModuleService.modules.PEOPLE_USERS, {
                    userId: this.model.id
                })
            };
        },

        __logout: function () {
            RoutingService.logout();
        }
    });
});
