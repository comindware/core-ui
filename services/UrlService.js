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

define([
        'core/utils/utilsApi'
    ],
    function (utilsApi) {
        'use strict';

        var objectTypes = {
            RECORD_TYPE: 'RecordType',
            ROOM: 'Room',
            PROJECT: 'Project',
            ACCOUNT_GROUP: 'AccountGroup',
            PROCESS_TEMPLATE: 'ProcessTemplate',
            FORM: 'Form',
            DATA_SOURCE: 'DataSource'
        };

        var objectIdPrefixes = {};
        objectIdPrefixes[objectTypes.RECORD_TYPE] = 'oa.';
        objectIdPrefixes[objectTypes.PROCESS_TEMPLATE] = 'pa.';
        objectIdPrefixes[objectTypes.ROOM] = 'room.';
        objectIdPrefixes[objectTypes.PROJECT] = 'project.';
        objectIdPrefixes[objectTypes.ACCOUNT_GROUP] = 'group.';
        objectIdPrefixes[objectTypes.FORM] = 'form.';
        objectIdPrefixes[objectTypes.DATA_SOURCE] = 'ds.';

        return {
            encodeObjectId: function (objectType, objectId) {
                var prefix = objectIdPrefixes[objectType];
                if (!prefix) {
                    utilsApi.helpers.throwFormatError('Invalid objectType.');
                }
                if (!objectId) {
                    utilsApi.helpers.throwFormatError('Empty object id: `' + objectId + '`.');
                }
                if (objectId.indexOf(prefix) === 0) {
                    return objectId.substring(prefix.length);
                }
                return objectId;
            },
            
            decodeObjectId: function (objectType, objectId) {
                var prefix = objectIdPrefixes[objectType];
                if (!prefix) {
                    utilsApi.helpers.throwFormatError('Invalid objectType.');
                }
                if (!objectId) {
                    utilsApi.helpers.throwFormatError('Empty object id: `' + objectId + '`.');
                }
                if (_.isString(objectId) && objectId.indexOf(prefix) === 0) {
                    return objectId;
                }
                if (!_.isFinite(parseInt(objectId))) {
                    utilsApi.helpers.throwFormatError('Invalid object id: `' + objectId + '`.');
                }

                return prefix + objectId;
            },

            objectTypes: objectTypes
        };
    });
