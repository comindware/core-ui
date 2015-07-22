/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/popout.html', 'module/lib', 'core/utils/utilsApi', 'core/services/WindowService'],
    function (template, lib, utils, WindowService) {
        'use strict';

        var slice = Array.prototype.slice;

        var classes = {
            OPEN: 'open',
            ALIGN_RIGHT: 'popout__wrp_right',
            CUSTOM_ANCHOR: 'popout__action-btn',
            DEFAULT_ANCHOR: 'popout__action'
        };

        var config = {
            BOTTOM_HEIGHT_OFFSET: 20
        };

        var popoutAlign = {
            LEFT: 'left',
            RIGHT: 'right'
        };

        var height = {
            AUTO: 'auto',
            BOTTOM: 'bottom'
        };

        var defaultOptions = {
            popoutAlign: popoutAlign.RIGHT,
            customAnchor: false,
            fade: false,
            height: 'auto',
            autoOpen: true
        };

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                _.extend(this.options, _.clone(defaultOptions), options || {});
                utils.helpers.ensureOption(options, 'buttonView');
                utils.helpers.ensureOption(options, 'panelView');
                _.bindAll(this, 'open', 'close', '__handleBlur', '__handleWindowResize');
            },

            template: Handlebars.compile(template),

            className: 'popout',

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
                //noinspection JSValidateTypes
                this.isOpen = false;
                if (this.button) {
                    this.stopListening(this.button);
                }
                this.button = new this.options.buttonView(_.result(this.options, 'buttonViewOptions'));
                this.listenTo(this.button, 'all', function() {
                    var args = slice.call(arguments);
                    args[0] = 'button:' + args[0];
                    this.triggerMethod.apply(this, args);
                });
                this.buttonRegion.show(this.button);
                if (this.options.popoutAlign === popoutAlign.RIGHT) {
                    this.ui.panel.addClass(classes.ALIGN_RIGHT);
                }
                if (this.options.customAnchor) {
                    this.ui.button.addClass(classes.CUSTOM_ANCHOR);
                } else {
                    this.ui.button.addClass(classes.DEFAULT_ANCHOR);
                }
            },

            __handleClick: function () {
                if (this.options.autoOpen) {
                    this.open();
                }
            },

            open: function () {
                if (this.isOpen) {
                    return;
                }
                this.trigger('before:open', this);
                var panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
                    parent: this
                });
                if (this.panelView) {
                    this.stopListening(this.panelView);
                }
                this.panelView = new this.options.panelView(panelViewOptions);
                this.listenTo(this.panelView, 'all', function() {
                    var args = slice.call(arguments);
                    args[0] = 'panel:' + args[0];
                    this.triggerMethod.apply(this, args);
                });
                this.$el.addClass(classes.OPEN);
                if (this.options.fade) {
                    WindowService.fadeIn();
                }
                this.ui.panel.css('display', 'block');
                this.ui.panel.show({
                    duration: 0,
                    complete: function () {
                        this.panelRegion.show(this.panelView);
                        if (this.options.height === height.BOTTOM) {
                            $(window).on('resize', this.__handleWindowResize);
                            this.__handleWindowResize();
                        }
                        this.focus();
                        //noinspection JSValidateTypes
                        this.isOpen = true;
                        this.trigger('open', this);
                    }.bind(this)
                });
            },

            close: function () {
                if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
                    return;
                }
                this.trigger('before:close', this);
                if (this.options.fade) {
                    WindowService.fadeOut();
                }
                if (this.options.height === height.BOTTOM) {
                    $(window).off('resize', this.__handleWindowResize);
                }
                this.ui.panel.hide({
                    duration: 0,
                    complete: function () {
                        this.$el.removeClass(classes.OPEN);
                        this.panelRegion.reset();
                        //noinspection JSValidateTypes
                        this.isOpen = false;
                        this.ui.panel.blur();
                        this.render();
                        this.trigger('close', this);
                    }.bind(this)
                });
            },

            focus: function () {
                this.ui.panel.focus();
            },

            __handleBlur: function () {
                setTimeout(function () {
                    if (this.$el.find(document.activeElement).length > 0) {
                        $(document.activeElement).one('blur', this.__handleBlur);
                    } else {
                        this.close();
                    }
                }.bind(this), 15);
            },

            __handleWindowResize: function () {
                var outlineDiff = (this.panelView.$el.outerHeight() - this.panelView.$el.height());
                var panelHeight = $(window).height() - this.panelView.$el.offset().top - outlineDiff - config.BOTTOM_HEIGHT_OFFSET;
                this.panelView.$el.height(panelHeight);
            }
        });
    });
