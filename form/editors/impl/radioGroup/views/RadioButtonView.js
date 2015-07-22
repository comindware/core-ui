/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['module/lib', 'text!../templates/radioButton.html'],
    function (utils, template) {
        'use strict';

        return Marionette.ItemView.extend({

            template: Handlebars.compile(template),

            className: 'l-radiobutton',

            focusElement: null,

            attributes: {
                'tabindex': '0'
            },

            initialize: function (options) {
                this.enabled = options.enabled;
            },

            ui: {
                toggleButton: '.js-toggle-button',
                displayText: '.js-display-text'
            },

            classes: {
                checked: 'pr-checked'
            },

            modelEvents: {
                'selected': '__toggle',
                'deselected': '__toggle'
            },

            events: {
                'click @ui.toggleButton': '__changeModelSelected',
                'click @ui.displayText': '__changeModelSelected'
            },

            onRender: function () {
                if (this.model.get('id') === this.options.selected) {
                    this.model.select();
                }
            },

            __toggle: function () {
                this.$el.toggleClass(this.classes.checked, this.model.selected);
            },

            __changeModelSelected: function () {
                if (!this.enabled) {
                    return;
                }
                this.model.select();
            },

            setEnabled: function (enabled) {
                this.enabled = enabled;
            }
        });
    });
