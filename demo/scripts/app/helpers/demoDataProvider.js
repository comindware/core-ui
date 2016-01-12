/**
 * Developer: Stepan Burguchev
 * Date: 8/14/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([], function () {
    'use strict';

    return {
        createIdFullNameCollection: function () {
            return new Backbone.Collection(_.map([
                'Alexander Drozd',
                'Alexandra Bitirim',
                'Alexander Egorov',
                'Alexandra Sindyaeva',
                'Alexey Prykin',
                'Anastasia Nagaeva',
                'Anatoly Belaychuk',
                'Alexander Pankov',
                'Alexey Prykin',
                'Anatoly Belaychuk'
            ], function (fullName, i) {
                return {
                    id: i,
                    fullName: fullName
                };
            }));
        }
    };
});
