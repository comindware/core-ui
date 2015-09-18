/**
 * Developer: Stepan Burguchev
 * Date: 1/15/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        './BlurableBehavior',
        'core/services/WindowService'
    ],

    function (BlurableBehavior, WindowService) {
        'use strict';

        var defaultOptions = {
            selector: null,
            allowNestedFocus: true,
            onBlur: null
        };

        return Marionette.Behavior.extend({
            initialize: function (options, view) {
                _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));

                view.close = this.close.bind(this);
            },

            behaviors: {
                BlurableBehavior: {
                    behaviorClass: BlurableBehavior,
                    onBlur: 'close'
                }
            },

            onRender: function () {
                this.__getFocusableEl().addClass('l-popup');
            },

            onShow: function () {
                this.__getFocusableEl().focus();
            },

            __getFocusableEl: function () {
                if (this.options.selector) {
                    return this.$(this.options.selector);
                } else {
                    return this.$el;
                }
            },

            close: function (result) {
                if (result) {
                    this.view.trigger('accept', result);
                } else {
                    this.view.trigger('reject');
                }
                this.view.trigger('close');
                WindowService.closePopup();
            }
        });
    });
