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
            SELECTED: 'dev-multi-select-item_selected'
        };

        return Marionette.ItemView.extend({
            className: function() {
                return this.model.selected ? classes.SELECTED : '';
            },

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
                'select deselect': '__updateSelected'
            },

            __toggle: function() {
                if (this.model.selected) {
                    this.model.selected = false;
                    this.model.trigger('deselect', this.model);
                    this.$el.removeClass(classes.SELECTED);
                } else {
                    this.model.selected = true;
                    this.model.trigger('select', this.model);
                    this.$el.addClass(classes.SELECTED);
                }
            },

            __updateSelected: function() {
                this.el.className = this.className();
            }
        });
    }
);
