/**
 * Developer: Ksenia Kartvelishvili
 * Date: 16.04.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['module/lib', 'core/list/listApi', 'core/utils/utilsApi', 'text!../templates/listItem.html' ],
    function (lib, list, utils, template) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
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

            __select: function (model) {
                this.reqres.request('member:select', model);
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
