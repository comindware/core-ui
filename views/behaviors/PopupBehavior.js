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

        return BlurableBehavior.extend({
            initialize: function (options, view) {
                _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));

                _.bindAll(this, '__onBlur');

                view.focus = this.__focus.bind(this);
            },

            onRender: function () {
                this.__getFocusableEl().attr('tabindex', 0);
                this.__getFocusableEl().addClass('l-popup');
            },

            onShow: function () {
                this.__focus();
            },

            close: function (result) {
                if (result) {
                    this.view.trigger('accept', result);
                } else {
                    this.view.trigger('reject');
                }
                this.view.trigger('close');
                WindowService.closePopup();
            },

            __onBlur: function () {
                var $focusableEl = this.__getFocusableEl();
                _.defer(function () {
                    if ($focusableEl[0] === document.activeElement || $focusableEl.find(document.activeElement).length > 0) {
                        $(document.activeElement).one('blur', this.__onBlur);
                    } else {
                        this.close();
                    }
                }.bind(this));
            }
        });
    });
