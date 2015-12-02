/**
 * Developer: Stepan Burguchev
 * Date: 5/22/2015
 * Copyright: 2009-2015 Comindware�
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
        './dateHelpers',
        './cookieHelpers',
        './keyCode',
        './handlebarsHelpers',
        './jquery/selector.focusable'
    ],
    function (
        comparators,
        helpers,
        htmlHelpers,
        dateHelpers,
        cookieHelpers,
        keyCode
    ) {
        'use strict';


        return /** @lends module:core.utils*/ {
            /**
             * Набор компораторов (могут использоваться в Backbone collections или в _.sortBy)
             * @namespace
             * */
            comparators: comparators,
            /**
             * Набор вспомогательных методов общего назначения
             * @namespace
             * */
            helpers: helpers,
            /**
             * Набор вспомогательных методов для манипуляций с html
             * @namespace
             * */
            htmlHelpers: htmlHelpers,
            /**
             * Набор вспомогательных методов для работы с датами и временем
             * @namespace
             * */
            dateHelpers: dateHelpers,
            /**
             * Набор вспомогательных методов для работы с cookie's
             * @namespace
             * */
            cookieHelpers: cookieHelpers,
            /**
             * Клавиатурные коды
             * @namespace
             * */
            keyCode: keyCode
        };
    });
