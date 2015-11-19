/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['./ListPanelView', './MenuItemView'],
    function (ListPanelView, MenuItemView) {
        'use strict';

        /**
         * Some description for initializer
         * @name MenuPanelView
         * @memberof module:core.dropdown.views
         * @class MenuPanelView
         * @constructor
         * @description MenuPanel
         * @extends module:core.dropdown.views.ListPanelView {@link module:core.dropdown.views.ListPanelView}
         * */
        return ListPanelView.extend({
            initialize: function (options) {
                ListPanelView.prototype.initialize.apply(this, _.toArray(arguments));
            },

            className: 'popout-menu',

            childView: MenuItemView,

            getChildView: function(model){
                if (model.get('customView'))
                    return model.get('customView');
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

