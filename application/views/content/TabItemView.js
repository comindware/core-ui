/**
 * Developer: Stepan Burguchev
 * Date: 7/1/2015
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
    'text!../../templates/content/tabItem.html'
], function (lib, template) {
        'use strict';

        var classes = {
            SELECTED: 'dev-selected'
        };

        return Marionette.ItemView.extend({
            initialize: function () {
            },

            modelEvents: {
                'selected': '__updateSelected',
                'deselected': '__updateSelected',
                'change': 'render'
            },
            
            className: 'dev-default-content-view__header-tabs__tab-item',

            template: Handlebars.compile(template),

            onRender: function () {
                this.__updateSelected();
            },

            __updateSelected: function () {
                this.$el.toggleClass(classes.SELECTED, Boolean(this.model.selected));
            }
        });
    });
