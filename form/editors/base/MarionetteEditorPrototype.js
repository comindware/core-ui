/**
 * Developer: Stepan Burguchev
 * Date: 12/2/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

/*
*
* Marionette-based Backbone.Form editor. MUST NOT be used directly. Use EditorBase*View base views instead while implementing Marionette editors.
*
* */

define([
        'module/lib'
    ],
    function () {
        'use strict';

        var classes = {
            disabled: 'l-field_disabled',
            readonly: 'l-field_readonly'
        };

        var onFocus = function () {
            this.trigger('focus', this);
        };

        var onBlur = function () {
            this.trigger('blur', this);
        };

        var onRender = function () {
            this.$el.attr('id', this.id);
            this.$el.attr('name', this.getName());
            this.setPermissions(this.enabled, this.readonly);
            //noinspection JSUnresolvedVariable
            if (this.schema.editorClass) {
                //noinspection JSUnresolvedVariable
                this.$el.addClass(this.schema.editorClass);
            }
            if (this.schema.editorAttrs) {
                this.$el.attr(this.schema.editorAttrs);
            }
            this.setValue(this.value, true);
            if (this.focusElement) {
                this.$el.on('focus', this.focusElement, onFocus.bind(this));
                this.$el.on('blur', this.focusElement, onBlur.bind(this));
            } else {
                this.$el.on('focus', onFocus.bind(this));
                this.$el.on('blur', onBlur.bind(this));
            }
        };

        return {
            create: function(viewClass) {
                return {
                    defaultValue: null,

                    hasFocus: false,

                    constructor: function (options) {
                        options = options || {};

                        //Set initial value
                        if (options.model) {
                            if (!options.key) {
                                throw new Error("Missing option: 'key'");
                            }

                            this.model = options.model;
                            this.value = this.model.get(options.key);
                        }
                        else if (options.value !== undefined) {
                            this.value = options.value;
                        }

                        if (this.value === undefined) {
                            this.value = this.defaultValue;
                        }

                        //Store important data
                        _.extend(this, _.pick(options, 'key', 'form'));

                        var schema = this.schema = options.schema || {};

                        this.validators = options.validators || schema.validators;

                        this.on('render', onRender.bind(this));

                        schema.autocommit = schema.autocommit || options.autocommit;
                        if (schema.autocommit) {
                            this.on('change', this.commit.bind(this, {}));
                        }

                        this.enabled = schema.enabled = schema.enabled || options.enabled || (schema.enabled === undefined && options.enabled === undefined);
                        this.readonly = schema.readonly = schema.readonly || options.readonly || (schema.readonly !== undefined && options.readonly !== undefined);
                        schema.forceCommit = options.forceCommit || schema.forceCommit;

                        viewClass.prototype.constructor.apply(this, arguments);
                        if (this.model) {
                            this.listenTo(this.model, 'change:' + this.key, this.updateValue);
                            this.listenTo(this.model, 'sync', this.updateValue);
                        }
                    },

                    updateValue: function () {
                        this.setValue(this.getModelValue());
                    },

                    getModelValue: function () {
                        return !this.model ? undefined : this.model.get(this.key);
                    },

                    __getFocusElement: function () {
                        if (this.focusElement) {
                            return this.$el.find(this.focusElement);
                        } else {
                            return this.$el;
                        }
                    },

                    __triggerChange: function () {
                        this.trigger('change', this);
                    },

                    /**
                     * Get the value for the form input 'name' attribute
                     *
                     * @return {String}
                     *
                     * @api private
                     */
                    getName: function() {
                        var key = this.key || '';

                        //Replace periods with underscores (e.g. for when using paths)
                        return key.replace(/\./g, '_');
                    },

                    /**
                     * Get editor value
                     * Extend and override this method to reflect changes in the DOM
                     *
                     * @return {Mixed}
                     */
                    getValue: function() {
                        return this.value;
                    },

                    /**
                     * Set editor value
                     * Extend and override this method to reflect changes in the DOM
                     *
                     * @param {Mixed} value
                     */
                    setValue: function(value) {
                        this.value = value;
                    },

                    setPermissions: function (enabled, readonly) {
                        this.__setEnabled(enabled);
                        this.__setReadonly(readonly);
                    },

                    setEnabled: function (enabled) {
                        var readonly = this.getReadonly();
                        this.setPermissions(enabled, readonly);
                    },

                    setReadonly: function (readonly) {
                        var enabled = this.getEnabled();
                        this.setPermissions(enabled, readonly);
                    },

                    __setEnabled: function (enabled) {
                        this.enabled = enabled;
                        if (!this.enabled) {
                            this.$el.addClass(classes.disabled);
                        } else {
                            this.$el.removeClass(classes.disabled);
                        }
                    },

                    getEnabled: function () {
                        return this.enabled;
                    },

                    __setReadonly: function (readonly) {
                        this.readonly = readonly;
                        if (this.readonly && this.getEnabled()) {
                            this.$el.addClass(classes.readonly);
                        } else {
                            this.$el.removeClass(classes.readonly);
                        }
                    },

                    getReadonly: function () {
                        return this.readonly;
                    },

                    /**
                     * Give the editor focus
                     * Extend and override this method
                     */
                    focus: function() {
                        if (this.hasFocus) {
                            return;
                        }
                        this.__getFocusElement().focus();
                    },

                    /**
                     * Remove focus from the editor
                     * Extend and override this method
                     */
                    blur: function() {
                        if (!this.hasFocus) {
                            return;
                        }
                        this.__getFocusElement().blur();
                    },

                    /**
                     * Update the model with the current value
                     *
                     * @param {Object} [options]              Options to pass to model.set()
                     * @param {Boolean} [options.validate]    Set to true to trigger built-in model validation
                     *
                     * @return {Mixed} error
                     */
                    commit: function(options) {
                        options = options || {};
                        var error = this.validate();
                        if (error && !this.schema.forceCommit) {
                            return error;
                        }

                        this.listenTo(this.model, 'invalid', function(model, e) {
                            error = e;
                        });

                        this.model.set(this.key, this.getValue(), {
                            silent: false,
                            validate: options.validate === true
                        });

                        if (error && !this.schema.forceCommit) {
                            return error;
                        }
                        this.trigger(this.key + ':committed', this, this.model, this.getValue());
                        this.trigger('value:committed', this, this.model, this.key, this.getValue());
                    },

                    /**
                     * Check validity
                     *
                     * @return {Object|Undefined}
                     */
                    validate: function() {
                        var $el = this.$el,
                            error = null,
                            value = this.getValue(),
                            formValues = this.form ? this.form.getValue() : {},
                            validators = this.validators,
                            getValidator = this.getValidator;

                        if (validators) {
                            //Run through validators until an error is found
                            _.every(validators, function(validator) {
                                error = getValidator(validator)(value, formValues);

                                return error ? false : true;
                            });
                        }

                        return error;
                    },

                    /**
                     * Set this.hasFocus, or call parent trigger()
                     *
                     * @param {String} event
                     */
                    trigger: function(event) {
                        if (event === 'focus') {
                            this.hasFocus = true;
                        }
                        else if (event === 'blur') {
                            this.hasFocus = false;
                        }

                        return Marionette.ItemView.prototype.trigger.apply(this, arguments);
                    },

                    /**
                     * Returns a validation function based on the type defined in the schema
                     *
                     * @param {RegExp|String|Function} validator
                     * @return {Function}
                     */
                    getValidator: function(validator) {
                        var validators = Backbone.Form.validators;

                        //Convert regular expressions to validators
                        if (_.isRegExp(validator)) {
                            return validators.regexp({ regexp: validator });
                        }

                        //Use a built-in validator if given a string
                        if (_.isString(validator)) {
                            if (!validators[validator]) {
                                throw new Error('Validator "' + validator + '" not found');
                            }

                            return validators[validator]();
                        }

                        //Functions can be used directly
                        if (_.isFunction(validator)) {
                            return validator;
                        }

                        //Use a customised built-in validator if given an object
                        //noinspection JSUnresolvedVariable
                        if (_.isObject(validator) && validator.type) {
                            var config = validator;

                            //noinspection JSUnresolvedVariable
                            return validators[config.type](config);
                        }

                        //Unknown validator type
                        throw new Error('Invalid validator: ' + validator);
                    }
                };
            }
        };
    });
