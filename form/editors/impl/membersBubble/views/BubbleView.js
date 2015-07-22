/**
 * Developer: Ksenia Kartvelishvili
 * Date: 21.04.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['module/lib', 'text!../templates/bubble.html'],
    function (utils, template) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
            },

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return {
                    enabled: this.options.enabled
                };
            },

            tagName: 'li',

            className: 'bubbles__i',

            events: {
                'click .js-bubble-delete': '__delete'
            },

            ui: {
                clearButton: '.js-bubble-delete'
            },

            __delete: function(e) {
                e.stopPropagation();
                e.preventDefault();
                this.reqres.request('bubble:delete', this.model);
            },

            updateEnabled: function (enabled) {
                this.options.enabled = enabled;
                if (enabled) {
                    this.ui.clearButton.show();
                } else {
                    this.ui.clearButton.hide();
                }
            },

            onRender: function () {
                this.updateEnabled(this.options.enabled);
            }
        });
    });
