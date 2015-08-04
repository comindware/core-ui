/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'module/lib',
    'text!./templates/CommonField.html',
    './models/FieldInfoModel',
    './views/InfoButtonView',
    './views/InfoMessageView',
    'core/dropdown/dropdownApi'],
    function (lib, template, FieldInfoModel, InfoButtonView, InfoMessageView, dropdown) {
        'use strict';

        var classes = {
            REQUIRED: 'required',
            READONLY: 'readonly',
            HIDDEN: 'fr-hidden',
            DISABLED: 'disabled'
        };

        return Backbone.Form.Field.extend({
            initialize: function (options) {
                Backbone.Form.Field.prototype.initialize.apply(this, arguments);
                this.debounceValidate = _.debounce(function () {
                    this.validate();
                    this.editor.trigger('validated', this);
                }.bind(this), this.form.validationDelay);
                if (this.schema.autoValidate) {
                    this.editor.on('change', function () {
                        this.debounceValidate();
                    }.bind(this));
                    this.editor.on('blur', function () {
                        this.validate();
                        this.editor.trigger('validated', this);
                    }.bind(this));
                }
            },
            validate: function (options) {
                options = options || {};
                if (this.schema.validators) {
                    var error = this.editor.validate();
                    if (!options.silent) {
                        if (error) {
                            this.setError(error.message);
                        } else {
                            this.clearError();
                        }
                    }
                    return error;
                }
                return null;
            },
            setError: function (msg) {
                if (this.editor.hasNestedForm) {
                    return;
                }
                this.$el.addClass(this.errorClassName);
                if (this.fieldErrorModel) {
                    this.fieldErrorModel.set('text', msg);
                }
            },
            clearError: function () {
                this.$el.removeClass(this.errorClassName);
                if (this.fieldErrorModel) {
                    this.fieldErrorModel.set('text', '');
                }
            },
            render: function () {
                Backbone.Form.Field.prototype.render.apply(this, arguments);
                if (this.schema.validators) {
                    this.fieldErrorModel = new FieldInfoModel({
                        text: '',
                        error: true
                    });
                    var errorPopout = dropdown.factory.createPopout({
                        panelView: InfoMessageView,
                        panelViewOptions: {
                            model: this.fieldErrorModel
                        },
                        buttonView: InfoButtonView,
                        buttonViewOptions: {
                            model: this.fieldErrorModel
                        },
                        popoutFlow: 'left',
                        customAnchor: true
                    });
                    errorPopout.render();
                    this.$('.js-field-error').append(errorPopout.$el);
                    errorPopout.onRender();
                }
                if (this.schema.helpText) {
                    this.fieldInfoModel = new FieldInfoModel({
                        text: this.schema.helpText
                    });
                    var infoPopout = dropdown.factory.createPopout({
                        panelView: InfoMessageView,
                        panelViewOptions: {
                            model: this.fieldInfoModel
                        },
                        buttonView: InfoButtonView,
                        buttonViewOptions: {
                            model: this.fieldInfoModel
                        },
                        popoutFlow: 'left',
                        customAnchor: true
                    });
                    infoPopout.render();
                    this.$('.js-field-info').append(infoPopout.$el);
                    infoPopout.onRender();
                }
                if (this.schema.required) {
                    this.$el.addClass(classes.REQUIRED);
                }
                if (this.schema.readonly) {
                    this.$el.addClass(classes.READONLY);
                }
                if (this.schema.readonly || !this.schema.enabled) {
                    this.$el.addClass(classes.DISABLED);
                }
                if (this.schema.hidden) {
                    this.$el.addClass(classes.HIDDEN);
                }
                return this;
            }
        }, {
            template: Handlebars.compile(template)
        });
    });
