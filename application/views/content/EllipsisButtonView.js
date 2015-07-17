/**
 * Developer: Stepan Burguchev
 * Date: 7/15/2015
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
    'core/dropdown/dropdownApi',
    'text!../../templates/content/ellipsisButton.html'
], function (lib, dropdownApi, template) {
    'use strict';
    return Marionette.ItemView.extend({
        initialize: function () {
        },

        className: 'dev-default-content-view__header__tabs-menu__button',

        template: Handlebars.compile(template),

        behaviors: {
            CustomAnchorBehavior: {
                behaviorClass: dropdownApi.views.behaviors.CustomAnchorBehavior,
                anchor: '.js-anchor'
            }
        }
    });
});
