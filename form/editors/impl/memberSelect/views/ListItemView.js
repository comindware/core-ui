/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['module/lib', 'module/core', 'text!../templates/listItem.html'],
    function (utils, core, template) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
            },

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: core.list.views.behaviors.ListItemViewBehavior
                }
            },

            className: 'dd-list__i',

            template: Handlebars.compile(template),

            ui: {
                fullName: '.js-fullName'
            },

            templateHelpers: function () {
                return {
                    text: this.__getText()
                };
            },

            __getText: function () {
                return this.model.get('fullName') || this.model.get('username');
            },

            OnHighlighted: function (fragment)
            {
                var text = core.utils.htmlHelpers.highlightText(this.__getText(), fragment);
                this.ui.fullName.html(text);
            },

            OnUnhighlighted: function ()
            {
                this.ui.fullName.text(this.__getText());
            },

            events: {
                'click': '__select'
            },

            __select: function () {
                this.reqres.request('value:set', this.model.id);
            }
        });
    });
