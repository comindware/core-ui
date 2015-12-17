/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['./ListPanelView', './MenuItemView'],
    function (ListPanelView, MenuItemView) {
        'use strict';

        /**
         * @name MenuPanelView
         * @memberof module:core.dropdown.views
         * @class Одиночный элемент меню. Используется для создания стандартного меню фабричным методом
         * {@link module:core.dropdown.factory createMenu}.
         * @constructor
         * @extends Marionette.ItemView
         * */

        return ListPanelView.extend({
            initialize: function (options) {
                ListPanelView.prototype.initialize.apply(this, _.toArray(arguments));
            },

            className: 'popout-menu',

            childView: MenuItemView,

            getChildView: function(model){
                if (model.get('customView')) {
                    return model.get('customView');
                }
                return MenuItemView;
            },

            childEvents: {
                'execute': '__execute'
            },

            __execute: function (child, model) {
                this.options.parent.close();
                this.options.parent.trigger('execute', model.id, model);
            }
        });
    });

