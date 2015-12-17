/**
 * Developer: Ksenia Kartvelishvili
 * Date: 16.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['core/libApi', 'core/list/listApi', 'core/utils/utilsApi', 'text!../templates/listItem.html' ],
    function (lib, list, utils, template) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function (options) {
            },

            template: Handlebars.compile(template),

            ui: {
                name: '.js-name'
            },

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: list.views.behaviors.ListItemViewBehavior
                }
            },

            events: {
                'click': '__select'
            },

            __select: function () {
                this.trigger('member:select', this.model);
            },

            onHighlighted: function (fragment) {
                var text = utils.htmlHelpers.highlightText(this.model.get('name'), fragment);
                this.ui.name.html(text);
            },

            onUnhighlighted: function () {
                this.ui.name.text(this.model.get('name'));
            }
        });
    });
