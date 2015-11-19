/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/menuItem.html', 'module/lib'],
    function (template) {
        'use strict';

        /**
         * Some description for initializer
         * @name MenuItemView
         * @memberof module:core.dropdown.views
         * @class MenuItemView
         * @constructor
         * @description MenuItem
         * @extends Marionette.ItemView
         * */
        return Marionette.ItemView.extend({
            initialize: function () {
            },

            tagName: 'li',

            className: 'popout-menu__i',

            template: Handlebars.compile(template),

            events: {
                'click': function () {
                    this.trigger('execute', this.model);
                }
            }
        });
    });
