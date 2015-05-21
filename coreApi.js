/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        './utils/comparators',
        './utils/helpers',
        './utils/htmlHelpers',
        './utils/keyCode'
    ],
    function (
        comparators,
        helpers,
        htmlHelpers,
        keyCode
    ) {
        'use strict';

        //noinspection UnnecessaryLocalVariableJS
        /**
         * Core UI components. These are the ground components to build Comindware web application.
         * @exports core
         * */
        return {
            utils: {
                comparators: comparators,
                helpers: helpers,
                htmlHelpers: htmlHelpers,
                keyCode: keyCode
            }
        };
    });
