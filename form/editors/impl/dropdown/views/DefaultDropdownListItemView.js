/**
 * Developer: Stepan Burguchev
 * Date: 1/16/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'core/list/listApi',
        'core/utils/utilsApi',
        'text!../templates/defaultDropdownListItem.html'
    ],
    function (list, utils, template) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
            },

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: list.views.behaviors.ListItemViewBehavior
                }
            },

            className: 'dd-list__i',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                var model = this.model.toJSON();
                var displayAttribute = this.options.displayAttribute;
                return {
                    text: _.result(model, displayAttribute)
                };
            },

            events: {
                'click': '__select'
            },

            onHighlighted: function (fragment) {
                var text = utils.htmlHelpers.highlightText(this.model.get('text'), fragment);
                this.$el.html(text);
            },

            onUnhighlighted: function () {
                this.$el.html(this.model.get('text'));
            },

            __select: function () {
                this.reqres.request('value:set', this.model);
                return false;
            }
        });
    });
