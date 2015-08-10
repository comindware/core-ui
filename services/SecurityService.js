/**
 * Developer: Stepan Burguchev
 * Date: 6/29/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([ 'core/utils/utilsApi'],
    function (utilsApi) {
        'use strict';

        var globalPermissions = {
            SYSTEM_ADMINISTRATION: 'system_administration',
            USER_MANAGEMENT: 'user_management',
            APP_DESIGN: 'app_design',
            DEFAULT_USER: 'default_user'
        };

        return {
            initialize: function (options) {
            },

            hasGlobalPermission: function (permissionId) {
                return Context.configurationModel.GlobalPermissions[0] === permissionId;
            },

            globalPermissions: globalPermissions
        };
    });
