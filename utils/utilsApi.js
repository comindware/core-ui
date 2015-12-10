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


        return /** @lends module:core.utils */ {
            /**
             * A set of useful comparators compatible with <code>_.sortBy()</code>.<br/><br/> The following naming convention is used:
             * <code>&lt;dataType&gt;Comparator&lt;Arguments count: 1 or 2&gt;&lt;Comparing direction: 'Asc' or 'Desc'&gt;</code>.<br/><br/>
             * For example: `stringComparator2Asc` means that comparator function takes 2 string objects and compares it in ascending order.<br/><br/>
             * Can be used as <code>comparator</code> in Backbone.Collection.
             * @namespace
             * */
            comparators: comparators,
            /**
             * Набор вспомогательных методов общего назначения.
             * @namespace
             * */
            helpers: helpers,
            /**
             * Набор вспомогательных методов для манипуляций с html.
             * @namespace
             * */
            htmlHelpers: htmlHelpers,
            /**
             * Набор вспомогательных методов для работы с датами и временем.
             * @namespace
             * */
            dateHelpers: dateHelpers,
            /**
             * Набор вспомогательных методов для работы с cookies.
             * @namespace
             * */
            cookieHelpers: cookieHelpers,
            /**
             * Справочник констант с кодами клавиатуры.
             * @namespace
             * */
            keyCode: keyCode
        };
    });
