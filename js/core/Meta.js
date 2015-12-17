/**
 * Developer: Stepan Burguchev
 * Date: 2/3/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([],
    function () {
        'use strict';

        var objectPropertyTypes = {
            STRING: 'String',
            BOOLEAN: 'Boolean',
            DATETIME: 'DateTime',
            DURATION: 'Duration',
            DECIMAL: 'Decimal',
            INTEGER: 'Integer',
            DOUBLE: 'Double',
            ACCOUNT: 'Account',
            DOCUMENT: 'Document',
            INSTANCE: 'Instance',
            COLLECTION: 'Collection',
            ENUM: 'Enum'
        };

        return {
            objectPropertyTypes: objectPropertyTypes
        };
    });
