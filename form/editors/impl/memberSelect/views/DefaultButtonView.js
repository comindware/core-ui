/**
 * Developer: Ksenia Kartvelishvili
 * Date: 24.03.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['core/dropdown/dropdownApi',
        'module/lib',
        'text!../templates/defaultButton.html'
    ],
    function (dropdown, lib, template) {
        'use strict';

        var classes = {
            EMPTY_EL: 'pr-empty'
        };

        return Marionette.ItemView.extend({
            initialize: function (options) {
                this.enabled = options.enabled;
                this.reqres = options.reqres;
                this.emptyElClass = options.emptyElClass || classes.EMPTY_EL;
                this.options.template = Handlebars.compile(options.template || template);
            },

            behaviors: {
                CustomAnchorBehavior: {
                    behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
                    anchor: '.js-anchor'
                }
            },

            className: 'field-user btn-wrp',

            ui: {
                text: '.js-text',
                clearButton: '.js-clear-button'
            },

            events: {
                'click @ui.clearButton': '__clear',
                'click @ui.text': '__navigate',
                'click': '__click'
            },

            __click: function () {
                this.reqres.request('panel:open');
            },

            __clear: function () {
                this.reqres.request('value:clear');
                return false;
            },

            __navigate: function () {
                var member = this.model.get('member');
                if (member) {
                    this.reqres.request('value:navigate', member.id);
                    return false;
                }
            },

            setEnabled: function (enabled) {
                this.enabled = enabled;
                if (enabled) {
                    this.ui.clearButton.show();
                } else {
                    this.ui.clearButton.hide();
                }
            },

            modelEvents: {
                'change:member': 'changeMember'
            },

            changeMember: function() {
                this.render();
                this.onRender();
            },

            onRender: function () {
                this.setEnabled(this.enabled);
                if (!this.model.get('member')) {
                    this.$el.addClass(classes.EMPTY_EL);
                }
            }
        });
    });
