/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(
    [
        'core/list/listApi',
        'core/utils/utilsApi',
        'text!../templates/multiSelectItem.html'
    ],
    function(list, utils, template) {
        'use strict';

        var classes = {
            BASE: 'multiselect-i',
            SELECTED: 'dev-multiselect-i_selected'
        };

        return Marionette.ItemView.extend({
            className: classes.BASE,

            template: Handlebars.compile(template),

            templateHelpers: function() {
                var displayAttribute = this.getOption('displayAttribute');

                return {
                    text: _.result(this.model.toJSON(), displayAttribute)
                };
            },

            events: {
                'click': '__toggle'
            },

            modelEvents: {
                'select': '__markSelected',
                'deselect': '__markDeselected'
            },

            __toggle: function() {
                if (this.model.selected) {
                    this.model.trigger('deselect', this.model);
                } else {
                    this.model.trigger('select', this.model);
                }
            },

            __markSelected: function() {
                this.$el.addClass(classes.SELECTED);
            },

            __markDeselected: function() {
                this.$el.removeClass(classes.SELECTED);
            }
        });
    }
);
