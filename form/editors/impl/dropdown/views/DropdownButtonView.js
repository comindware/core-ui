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

define(['module/lib', 'text!../templates/dropdownButton.html'],
    function (lib, template) {
        'use strict';

        var classes = {
        };

        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
            },

            className: 'field field_dropdown',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                var value = this.model.get('value');
                var displayAttribute = this.model.get('displayAttribute');
                return {
                    hasValue: Boolean(value),
                    text: value ? _.result(value.toJSON(), displayAttribute) : null
                };
            },

            ui: {
                text: '.js-text'
            },

            events: {
                'click': '__click'
            },

            modelEvents: {
                'change:value': 'render'
            },

            __click: function () {
                this.reqres.request('panel:open');
            }
        });
    });
