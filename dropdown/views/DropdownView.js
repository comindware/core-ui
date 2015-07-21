/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/dropdown.html', 'module/lib', 'core/utils/utilsApi'],
    function (template, lib, utils) {
        'use strict';

        var classes = {
            OPEN: 'open',
            DROPDOWN_WRP_OVER: 'dropdown__wrp_over'
        };

        var panelPosition = {
            DOWN: 'down',
            DOWN_OVER: 'down-over'
        };

        var defaultOptions = {
            autoOpen: true,
            panelPosition: panelPosition.DOWN
        };

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                _.extend(this.options, _.clone(defaultOptions), options || {});
                utils.helpers.ensureOption(options, 'buttonView');
                utils.helpers.ensureOption(options, 'panelView');
                _.bindAll(this, 'open', 'close', '__handleBlur');
            },

            template: Handlebars.compile(template),

            className: 'dropdown',

            regions: {
                buttonRegion: '.js-button-region',
                panelRegion: '.js-panel-region'
            },

            ui: {
                button: '.js-button-region',
                panel: '.js-panel-region'
            },

            events: {
                'click @ui.button': '__handleClick',
                'blur @ui.panel': '__handleBlur'
            },

            onRender: function () {
                if (this.button) {
                    this.stopListening(this.button);
                }
                this.button = new this.options.buttonView(_.extend({ parent: this }, _.result(this.options, 'buttonViewOptions')));
                this.listenTo(this.button, 'all', function() {
                    var args = Array.prototype.slice.call(arguments);
                    args[0] = 'button:' + args[0];
                    this.triggerMethod.apply(this, args);
                });
                this.buttonRegion.show(this.button);

                switch (this.options.panelPosition) {
                case panelPosition.DOWN:
                    break;
                case panelPosition.DOWN_OVER:
                    this.ui.panel.addClass(classes.DROPDOWN_WRP_OVER);
                    break;
                }
            },

            correctPosition: function () {
                var panelHeight = this.panelRegion.$el.height(),
                    bodyHeight = $('body').height(),
                    panelTopOffset = this.panelRegion.$el.offset().top,
                    isTopPosition = bodyHeight - panelTopOffset < panelHeight;

                if (isTopPosition) {
                    this.panelRegion.$el.css({
                        top: -panelHeight
                    });

                    this.panelRegion.$el.addClass('dev-panel-top');
                    this.ui.button.addClass('dev-panel-top');
                } else {
                    this.panelRegion.$el.removeClass('dev-panel-top');
                    this.ui.button.removeClass('dev-panel-top');
                }
            },

            open: function () {
                if (this.isOpen) {
                    return;
                }
                var panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
                    parent: this
                });
                
                this.$el.addClass(classes.OPEN);
                this.ui.panel.css('display', 'block');
                if (this.panelView) {
                    this.stopListening(this.panelView);
                }
                this.panelView = new this.options.panelView(panelViewOptions);
                this.listenTo(this.panelView, 'all', function() {
                    var args = Array.prototype.slice.call(arguments);
                    args[0] = 'panel:' + args[0];
                    this.triggerMethod.apply(this, args);
                });
                this.panelRegion.show(this.panelView);
                this.correctPosition();

                if ($.contains(this.el, document.activeElement)) {
                    $(document.activeElement).one('blur', this.__handleBlur);
                } else {
                    this.ui.panel.focus();
                }
                //noinspection JSValidateTypes
                this.isOpen = true;
                this.trigger('open', this);
            },

            close: function () {
                if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
                    return;
                }
                var closeArgs = _.toArray(arguments);
                this.ui.panel.hide({
                    duration: 0,
                    complete: function () {
                        this.$el.removeClass(classes.OPEN);
                        this.panelRegion.reset();
                        //noinspection JSValidateTypes
                        this.isOpen = false;
                        // selecting focusable parent after closing is important to maintant nested dropdowns
                        var firstFocusableParent = this.ui.panel.parents().filter(':focusable')[0];
                        if (firstFocusableParent) {
                            $(firstFocusableParent).focus();
                        }
                        
                        this.trigger.apply(this, [ 'close', this ].concat(closeArgs));
                        this.render();
                    }.bind(this)
                });
            },

            __handleClick: function () {
                if (this.options.autoOpen) {
                    this.open();
                }
            },

            __handleBlur: function () {
                setTimeout(function () {
                    if ($.contains(this.el, document.activeElement)) {
                        $(document.activeElement).one('blur', this.__handleBlur);
                    } else {
                        this.close();
                    }
                }.bind(this), 15);
            }
        });
    });
