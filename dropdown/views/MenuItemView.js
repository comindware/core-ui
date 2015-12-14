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

define(['text!../templates/menuItem.html', 'core/libApi'],
    function (template) {
        'use strict';

        /**
         * @name MenuItemView
         * @memberof module:core.dropdown.views
         * @class Одиночный элемент меню. Используется в связке с MenuPanelView для создания стандартного меню фабричным методом
         * {@link module:core.dropdown.factory createMenu}.
         * @constructor
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
