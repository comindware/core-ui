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

        var modules = {
            SETTINGS_WORKSPACE: 'module:settings:workspace',
            MYTASKS: 'module:myTasks',
            PEOPLE_USERS: 'module:people:users',

            PROCESS_PROCESSTEMPLATES_SHOWALL: 'module:process:processTemplates:showAll',

            PROCESS_ARCHITECTURE_SHOWALL: 'module:process:architecture:showAll',

            PROCESS_RECORDTYPES_ATTRIBUTES: 'module:process:recordTypes:attributes',
            PROCESS_RECORDTYPES_DIAGRAM: 'module:process:recordTypes:diagram',
            PROCESS_RECORDTYPES_FORMDESIGNER: 'module:process:recordTypes:formDesigner',
            PROCESS_RECORDTYPES_SETTINGS: 'module:process:recordTypes:settings',
            PROCESS_RECORDTYPES_RECORDS: 'module:process:recordTypes:records',
            PROCESS_RECORDTYPES_SHOWALL: 'module:process:recordTypes:showAll',

            PROCESS_PROCESSMONITOR: 'module:process:processMonitor',
            PROCESS_DATADIAGRAM: 'module:process:dataDiagram'
        };

        return {
            getDefaultModuleUrl: function (moduleId, options) {
                return this.getModuleUrlByName(moduleId, 'default', options);
            },

            getModuleUrlByName: function (moduleId, urlName, options) {
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
                // TODO: match and replace options
                return url;
            },

            modules: modules
        };
    });
