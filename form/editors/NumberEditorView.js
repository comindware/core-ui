/**
 * Developer: Stepan Burguchev
 * Date: 10/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!./templates/numberEditor.html', './base/BaseItemEditorView', 'module/lib', 'core/utils/utilsApi'],
    function (template, BaseItemEditorView, lib, utils) {
        'use strict';

        var changeMode = {
            keydown: 'keydown',
            blur: 'blur'
        };

        var defaultOptions = {
            max: null,
            min: 0,
            step: 1,
            page: 10,
            incremental: true,
            allowFloat: false,
            changeMode: changeMode.blur,
            showButtons: true,
            readonly: false
        };

        var keyCode = utils.keyCode;

        var allowedKeys = [
            keyCode.DELETE,
            keyCode.BACKSPACE,
            keyCode.TAB,
            keyCode.ESCAPE,
            keyCode.ENTER,
            keyCode.NUMPAD_ENTER,
            keyCode.NUMPAD_DECIMAL,
            keyCode.PERIOD,
            keyCode.HOME,
            keyCode.END,
            keyCode.RIGHT,
            keyCode.LEFT,
            keyCode.UP,
            keyCode.DOWN,
            keyCode.SUBTRACT,
            keyCode.NUMPAD_SUBTRACT
        ];

        Backbone.Form.editors.Number = BaseItemEditorView.extend({
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }
                _.bindAll(this, '__stop');
            },

            template: Handlebars.compile(template),

            focusElement: '.js-input',

            className: 'fr-number',

            ui: {
                input: '.js-input',
                spinnerUp: '.js-spinner-up',
                spinnerDown: '.js-spinner-down',
                spinnerButtons: '.js-spinner-button'
            },

            events: {
                'keydown @ui.input': '__keydown',
                'keyup @ui.input': function (event) {
                    if (this.options.readonly) {
                        return;
                    }
                    if ([keyCode.UP, keyCode.DOWN, keyCode.PAGE_UP, keyCode.PAGE_DOWN].indexOf(event.keyCode) !== -1) {
                        this.__stop();
                    }
                    if (this.options.changeMode === changeMode.keydown) {
                        this.__value(this.ui.input.val(), true, true, false);
                    }
                },
                'change @ui.input': function () {
                    this.__value(this.ui.input.val(), false, true, false);
                },
                'mousewheel @ui.input': function (event) {
                    if (!this.getEnabled()) {
                        return;
                    }
                    if (this.options.readonly) {
                        return;
                    }
                    this.__start();
                    this.__spin((event.deltaY > 0 ? 1 : -1) * this.options.step);
                    clearTimeout(this.mousewheelTimer);
                    //noinspection JSCheckFunctionSignatures
                    this.mousewheelTimer = setTimeout(this.__stop, 100);
                    return false;
                },
                'mousedown @ui.spinnerUp': function (event) {
                    event.preventDefault();
                    this.focus();
                    this.__setActive(this.ui.spinnerDown, true);
                    this.__start();
                    this.__repeat(null, 1);
                },
                'mousedown @ui.spinnerDown': function (event) {
                    event.preventDefault();
                    this.focus();
                    this.__setActive(this.ui.spinnerUp, true);
                    this.__start();
                    this.__repeat(null, -1);
                },
                "mouseup @ui.spinnerButtons": "__stop",
                'mouseleave @ui.spinnerButtons': '__stop'
            },

            onRender: function () {
               this.__value(this.value, false, false, true);
            },

            __setActive: function (el, isActive) {
                if (isActive) {
                    $(el).addClass('ui-state-active');
                } else {
                    $(el).removeClass('ui-state-active');
                }
            },

            setEnabled: function (enabled) {
                BaseItemEditorView.prototype.setEnabled.call(this, enabled);
                this.ui.input.prop('disabled', !enabled);
                if (enabled) {
                    this.ui.spinnerUp.show();
                    this.ui.spinnerDown.show();
                } else {
                    this.ui.spinnerUp.hide();
                    this.ui.spinnerDown.hide();
                }
            },

            __repeat: function(i, steps) {
                i = i || 500;

                clearTimeout(this.timer);
                this.timer = setTimeout(function() {
                    this.__repeat(40, steps);
                }.bind(this), i);

                this.__spin(steps * this.options.step);
            },

            __keydown: function(event)
            {
                if (this.options.readonly) {
                    return;
                }
                this.__start();
                var options = this.options;

                switch (event.keyCode) {
                case keyCode.UP:
                    this.__repeat(null, 1, event);
                    return false;
                case keyCode.DOWN:
                    this.__repeat(null, -1, event);
                    return false;
                case keyCode.PAGE_UP:
                    this.__repeat(null, options.page, event);
                    return false;
                case keyCode.PAGE_DOWN:
                    this.__repeat(null, -options.page, event);
                    return false;
                }

                if (event.ctrlKey === true || allowedKeys.indexOf(event.keyCode) !== -1) {
                    return true;
                }

                var charValue = null;
                if (event.keyCode >= keyCode.NUM_0 && event.keyCode <= keyCode.NUM_9) {
                    charValue = event.keyCode - keyCode.NUM_0;
                } else if (event.keyCode >= keyCode.NUMPAD_0 && event.keyCode <= keyCode.NUMPAD_9) {
                    charValue = event.keyCode - keyCode.NUMPAD_0;
                }
                var valid = charValue !== null;
                if (!valid) {
                    return false;
                }
            },
            
            __start: function() {
                if (!this.counter) {
                    this.counter = 1;
                }
                this.spinning = true;
            },

            __spin: function(step) {
                var value = this.getValue() || 0;

                if (!this.counter) {
                    this.counter = 1;
                }

                value = this.__adjustValue(value + step * this.__increment(this.counter));
                this.__value(value, false, true, false);
                this.counter++;
            },

            __stop: function() {
                if (!this.spinning) {
                    return;
                }

                this.__setActive(this.ui.spinnerButtons, false);
                clearTimeout(this.timer);
                clearTimeout(this.mousewheelTimer);
                this.counter = 0;
                this.spinning = false;
            },

            __value: function(value, suppressRender, triggerChange, force) {
                if (value === this.value && !force) {
                    return;
                }
                var parsed;
                if (value !== "" && value !== null) {
                    parsed = this.__parse(value);
                    if (parsed !== null) {
                        value = this.__adjustRange(parsed);
                        if (!this.options.allowFloat) {
                            value = Math.floor(value);
                        }
                    } else {
                        return;
                    }
                } else if (value === "") {
                    value = null;
                }

                this.value = value;
                if (!suppressRender) {
                    this.ui.input.val(value);
                }
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            __parse: function (val) {
                if (typeof val === "string" && val !== "") {
                    val = Number(val);
                    if (val === Number.POSITIVE_INFINITY) {
                        val = Number.MAX_VALUE;
                    } else if (val === Number.NEGATIVE_INFINITY) {
                        val = Number.MIN_VALUE;
                    }
                }
                return val === "" || isNaN(val) ? null : val;
            },

            __precision: function() {
                var precision = this.__precisionOf(this.options.step);
                if (this.options.min !== null) {
                    precision = Math.max(precision, this.__precisionOf(this.options.min));
                }
                return precision;
            },

            __precisionOf: function(num) {
                var str = num.toString();
                var decimal = str.indexOf(".");
                return decimal === -1 ? 0 : str.length - decimal - 1;
            },

            __increment: function(i) {
                var incremental = this.options.incremental;
                if (incremental) {
                    return $.isFunction(incremental) ?
                        incremental(i) :
                        Math.floor(i*i*i/50000 - i*i/500 + 17*i/200 + 1);
                }
                return 1;
            },

            __adjustRange: function (value) {
                var options = this.options;
                if (options.max !== null && value > options.max) {
                    return options.max;
                }
                if (options.min !== null && value < options.min) {
                    return options.min;
                }
                return value;
            },

            __adjustValue: function(value) {
                var base, aboveMin,
                    options = this.options;

                // make sure we're at a valid step
                // - find out where we are relative to the base (min or 0)
                base = options.min !== null ? options.min : 0;
                aboveMin = value - base;
                // - round to the nearest step
                aboveMin = Math.round(aboveMin / options.step) * options.step;
                // - rounding is based on 0, so adjust back to our base
                value = base + aboveMin;

                // fix precision from bad JS floating point math
                value = parseFloat(value.toFixed(this.__precision()));

                return value;
            },

            setValue: function(value) {
                this.__value(value, false, false, false);
            }
        });

        return Backbone.Form.editors.Number;
    });
