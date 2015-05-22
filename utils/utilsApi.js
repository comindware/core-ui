/**
 * Developer: Stepan Burguchev
 * Date: 5/22/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        './comparators',
        './helpers',
        './htmlHelpers',
        './keyCode'
    ],
    function (
        comparators,
        helpers,
        htmlHelpers,
        keyCode
    ) {
        'use strict';

        return {
            comparators: comparators,
            helpers: helpers,
            htmlHelpers: htmlHelpers,
            keyCode: keyCode
        };
    });
