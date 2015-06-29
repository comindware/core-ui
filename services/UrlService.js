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

define(['module/core'],
    function (core) {
        'use strict';

        var modules = {
            SETTINGS_WORKSPACE: 'module:settings:workspace',
            MYTASKS: 'module:myTasks',
            PEOPLE_USERS: 'module:people:users',
            PROCESS_PROCESSTEMPLATES_SHOWALL: 'module:process:processTemplates:showAll',
            PROCESS_ARCHITECTURE_SHOWALL: 'module:process:architecture:showAll',
            PROCESS_RECORDTYPES_SHOWALL: 'module:process:recordTypes:showAll',
            PROCESS_PROCESSMONITOR: 'module:process:processMonitor',
            PROCESS_DATADIAGRAM: 'module:process:dataDiagram'
        };

        var moduleUrlMap = {};
        moduleUrlMap[modules.SETTINGS_WORKSPACE] = 'Settings/Workspaces';
        moduleUrlMap[modules.MYTASKS] = 'MyTasks/Main';
        moduleUrlMap[modules.PEOPLE_USERS] = 'People/Users';
        moduleUrlMap[modules.PROCESS_PROCESSTEMPLATES_SHOWALL] = 'ProcessTemplate/ShowAll';
        moduleUrlMap[modules.PROCESS_ARCHITECTURE_SHOWALL] = 'Architecture/ShowAll';
        moduleUrlMap[modules.PROCESS_RECORDTYPES_SHOWALL] = 'RecordType/ShowAll';
        moduleUrlMap[modules.PROCESS_PROCESSMONITOR] = 'ProcessMonitor';
        moduleUrlMap[modules.PROCESS_DATADIAGRAM] = 'DataDiagram/Diagram';

        var objectTypes = {
            RECORD_TYPE: 'RecordType'
        };

        var objectIdPrefixes = {};
        objectIdPrefixes[objectTypes.RECORD_TYPE] = 'oa.';

        return {
            /**
             * Функция создает URL-ссылку к модулю на базе его moduleId.
             * @param {string} moduleId Уникальный идентификатор модуля, указываемый в атрибуте id файла Config.js
             * @returns {string} URL-ссылка на модуль
             * */
            createModuleLink: function (moduleId) {
                var url = '#' + moduleUrlMap[moduleId];
                if (!url) {
                    core.utils.helpers.throwFormatError('Failed to find a module with id `' + moduleId + '`.');
                }
                return url;
            },

            createObjectLink: function (objectType, options) {
                switch (objectType) {
                case objectTypes.RECORD_TYPE:
                    return '#RecordType/' + this.encodeObjectId(options.recordTypeId) + '/Overview';
                default:
                    core.utils.helpers.throwFormatError('Invalid objectType.');
                }
            },

            encodeObjectId: function (objectType, objectId) {
                var prefix = objectIdPrefixes[objectType];
                if (!prefix) {
                    core.utils.helpers.throwFormatError('Invalid objectType.');
                }
                if (!objectId) {
                    core.utils.helpers.throwFormatError('Empty object id: `' + objectId + '`.');
                }
                if (objectId.indexOf(prefix) === 0) {
                    return objectId.substring(prefix.length);
                }
                return objectId;
            },
            
            decodeObjectId: function (objectType, objectId) {
                var prefix = objectIdPrefixes[objectType];
                if (!prefix) {
                    core.utils.helpers.throwFormatError('Invalid objectType.');
                }
                if (!objectId) {
                    core.utils.helpers.throwFormatError('Empty object id: `' + objectId + '`.');
                }
                if (_.isString(objectId) && objectId.indexOf(prefix) === 0) {
                    return objectId;
                }
                if (!_.isFinite(parseInt(objectId))) {
                    core.utils.helpers.throwFormatError('Invalid object id: `' + objectId + '`.');
                }

                return prefix + objectId;
            },

            modules: modules,

            objectTypes: objectTypes
        };
    });
