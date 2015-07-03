/**
 * Developer: Stepan Burguchev
 * Date: 7/3/2015
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
        'core/utils/utilsApi',
        'module/moduleConfigs',
        'project/module/moduleConfigs',
        'process/module/moduleConfigs'
    ],
    function (lib, utilsApi, moduleConfigs, projectModuleConfigs, processModuleConfigs) {
        'use strict';

        var configs = _.flatten([ moduleConfigs, projectModuleConfigs, processModuleConfigs ]);

        return {
            getDefaultModuleUrl: function (moduleId) {
                return this.getModuleUrlByName(moduleId, 'default');
            },

            getModuleUrlByName: function (moduleId, urlName) {
                var moduleConfig = configs.findWhere({ id : moduleId });
                if (!moduleConfig) {
                    utilsApi.helpers.throwError('Failed to find a module with id `' + moduleId + '`.');
                }
                if (!moduleConfig.navigationUrl) {
                    utilsApi.helpers.throwError('The module `' + moduleId + '` is incomplete and doesn`t have navigationUrl.');
                }
                var url = moduleConfig.navigationUrl[urlName];
                if (!url) {
                    utilsApi.helpers.throwError('Failed to find navigation url `' + urlName + '` in the module `' + moduleId + '`');
                }
                return url;
            }
        };
    });
