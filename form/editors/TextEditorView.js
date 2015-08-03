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

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['text!./templates/textEditor.html', './base/BaseItemEditorView'],
    function (template, BaseItemEditorView) {
        'use strict';

        var changeMode = {
            blur: 'blur',
            keydown: 'keydown'
        };

        var defaultOptions = {
            changeMode: 'blur',
            emptyPlaceholder: Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.PLACEHOLDER'),
            readonlyPlaceholder: Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.READONLYPLACEHOLDER'),
            disablePlaceholder: Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.DISABLEPLACEHOLDER'),
            maxLength: null,
            readonly: false
        };

        Backbone.Form.editors.Text = BaseItemEditorView.extend({
            initialize: function (options) {
                options = options || {};
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.placeholder = this.options.emptyPlaceholder;
            },

            focusElement: '.js-input',

            ui: {
                input: '.js-input'
            },

            className: 'l-field',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return this.options;
            },

            events: {
                'keyup @ui.input': '__keyup',
                'change @ui.input': '__change'
            },

            __keyup: function () {
                if (this.options.changeMode === changeMode.keydown) {
                    this.__value(this.ui.input.val(), false, true);
                }

                this.trigger('keyup', this);
            },
            
            __change: function () {
                this.__value(this.ui.input.val(), false, true);
            },

            setValue: function (value) {
                this.__value(value, true, false);
            },

            setPermissions: function (enabled, readonly) {
                BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
                this.setPlaceholder();
            },

            setPlaceholder: function () {
                if (!this.getEnabled() || this.getReadonly()) {
                    this.placeholder = '';
                } else {
                    this.placeholder = this.options.emptyPlaceholder;
                }

                this.ui.input.prop('placeholder', this.placeholder);
            },

            __setEnabled: function (enabled) {
                BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
                this.ui.input.prop('disabled', !enabled);
            },

            __setReadonly: function (readonly) {
                BaseItemEditorView.prototype.__setReadonly.call(this, readonly);
                if (this.getEnabled()) {
                    this.ui.input.prop('readonly', readonly);
                }
            },

            onRender: function () {
                this.ui.input.val(this.getValue() || '');
            },

            __value: function (value, updateUi, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;
                if (updateUi) {
                    this.ui.input.val(value);
                }
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            select: function () {
                this.ui.input.select();
            },

            deselect: function () {
                this.ui.input.deselect();
            }
        });

        return Backbone.Form.editors.Text;
    });
