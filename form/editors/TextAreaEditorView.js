/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!./templates/textAreaEditor.html', './base/BaseItemEditorView'],
    function (template, BaseItemEditorView) {
        'use strict';

        var changeMode = {
            blur: 'blur',
            keydown: 'keydown'
        };

        var size = {
            auto: 'auto',
            fixed: 'fixed'
        };

        var defaultOptions = {
            changeMode: changeMode.blur,
            size: size.auto,
            emptyPlaceholder: Localizer.get('FORMEDITOR.TEXTEDITOR.ENTERTEXT'),
            readonlyPlaceholder: 'Field is readonly',
            disablePlaceholder: 'Field is disabled',
            maxLength: null,
            readonly: false,
            textHeight: null
        };

        Backbone.Form.editors.TextArea = BaseItemEditorView.extend({
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.placeholder = this.options.emptyPlaceholder;
            },

            focusElement: '.js-textarea',
            className: 'l-textarea',

            ui: {
                textarea: '.js-textarea'
            },

            events: {
                'change': '__change',
                'input': '__input',
                'keyup @ui.textarea': '__keyup'
            },

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return this.options;
            },

            setMaxHeight: function(){
                if (this.options.textHeight) {
                    this.options.maxHeight = parseInt(this.ui.textarea.css('lineHeight')) * this.options.textHeight;
                }
            },

            __keyup: function () {
                this.trigger('keyup', this);
            },

            onShow: function () {
                this.setMaxHeight();
                this.ui.textarea.val(this.getValue() || '').css('maxHeight', this.options.maxHeight);
                switch (this.options.size) {
                case size.auto:
                    this.ui.textarea.autosize({ append: '' });
                    this.ui.textarea.on('autosize.resized', function(){
                        this.trigger('resize');
                    }.bind(this));
                    break;
                }
            },

            setPermissions: function (enabled, readonly) {
                BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
                this.setPlaceholder();
            },

            setPlaceholder: function () {
                if (!this.getEnabled()) {
                    this.placeholder = this.options.disablePlaceholder;
                } else if (this.getReadonly()) {
                    this.placeholder = this.options.readonlyPlaceholder;
                } else {
                    this.placeholder = this.options.emptyPlaceholder;
                }

                this.ui.textarea.prop('placeholder', this.placeholder);
            },

            __setEnabled: function (enabled) {
                BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
                this.ui.textarea.prop('disabled', !enabled);
            },

            __setReadonly: function (readonly) {
                BaseItemEditorView.prototype.__setReadonly.call(this, readonly);
                if (this.getEnabled()) {
                    this.ui.textarea.prop('readonly', readonly);
                }
            },

            setValue: function (value) {
                this.__value(value, true, false);
            },

            __change: function () {
                this.__value(this.ui.textarea.val(), false, true);
            },

            __value: function (value, updateUi, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;
                if (updateUi) {
                    this.ui.textarea.val(value);
                }
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            __input: function () {
                if (this.options.changeMode === changeMode.keydown) {
                    this.__value(this.ui.textarea.val(), false, true);
                }
            },

            select: function () {
                this.ui.textarea.select();
            }
        });

        return Backbone.Form.editors.TextArea;
    });
