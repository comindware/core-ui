// @flow
/*
 *
 * Marionette-based Backbone.Form editor. MUST NOT be used directly. Use EditorBase*View base views instead while implementing Marionette editors.
 *
 * */

import formRepository from '../../formRepository';
import { keyCode } from 'utils';

const classes = {
    disabled: 'editor_disabled',
    readonly: 'editor_readonly',
    hidden: 'editor_hidden',
    FOCUSED: 'editor_focused',
    EMPTY: 'editor_empty',
    ERROR: 'js-editor_error'
};

const onRender = function() {
    if (this.id) {
        this.el.setAttribute('id', this.id);
    }
    this.setPermissions(this.enabled, this.readonly);
    this.setHidden(this.hidden);
    this.setValue(this.value);
    if (this.focusElement) {
        this.$el.on('focus', this.focusElement, this.onFocus);
        this.$el.on('blur', this.focusElement, this.onBlur);
        this.$el.on('keyup', this.focusElement, this.onKeyup);
    } else if (this.focusElement !== null) {
        this.$el.on('focus', this.onFocus);
        this.$el.on('blur', this.onBlur);
        this.$el.on('keyup', this.onKeyup);
    }
    this.__updateEmpty();

    // revalidate if model isInvalid
    if (this.model && this.model.validationResult) {
        if (this.field) {
            this.field.validate();
        } else {
            this.validate();
        }
    }
};

const onChange = function() {
    if (this.model && this.schema.autocommit) {
        this.commit();
    }
    if (this.__validatedOnce) {
        if (this.form) {
            this.form.validate();
        } else if (this.field) {
            this.field.validate();
        }
    }
    this.__updateEmpty();
};

/**
 * @name BaseEditorView
 * @memberof module:core.form.editors.base
 * @class Base class for all editors in the library.
 * While implementing editors, inherit from one of the following classes which in turn are inherited from this one:<ul>
 * <li><code>BaseCollectionEditorView</code></li>
 * <li><code>BaseCompositeEditorView</code></li>
 * <li><code>BaseEditorView</code></li></ul>
 * Possible events:<ul>
 * <li><code>'change' (thisEditorView)</code> - fires when the value inside the editor is changed.
 * This event doesn't imply any change in model (!).</li>
 * <li><code>'enabled' (enabled)</code> - fires when the property <code>enabled</code> is changed.</li>
 * <li><code>'readonly' (readonly)</code> - fires when the property <code>readonly</code> is changed.</li>
 * <li><code>'&lt;key&gt;:committed' (thisEditorView, model, value)</code> - fires when the value is committed into the model.</li>
 * <li><code>'value:committed' (thisEditorView, model, key, value)</code> - fires when the value is committed into the model.</li>
 * </ul>
 * @constructor
 * @extends Marionette.View
 * @param {Object} options Options object.
 * @param {Boolean} [options.autocommit=false] Indicates whether to call <code>commit()</code> method on the value change.
 * @param {Boolean} [options.forceCommit=false] Indicated whether to commit the value into the model if editors validation has failed (not recommended).
 * @param {Boolean} [options.enabled=true] The initial value of <code>enabled</code> flag. Can be changed later on by calling <code>setEnabled()</code> method.
 * @param {Boolean} [options.readonly=false] The initial value of <code>readonly</code> flag.
 *                                           Can be changed later on by calling <code>setReadonly()</code> method.
 * @param {Boolean} [options.model] A model which contains an attributes edited by this editor.
 *                                  Can only be used if the editor is created standalone (without a form).
 *                                   Must be used together with  <code>key</code> options.
 * @param {Boolean} [options.key] The name of an attribute in <code>options.model</code> edited by this editor.
 *                                Can only be used if the editor is created standalone (without a form).
 *                                Must be used together with  <code>model</code> options.
 * @param {Function[]} [options.validators] An array of validator function which look like the following:
 * <code>function(value, formValues) -> ({type, message}|undefined)</code>
 * @param {Object} [options.schema] When created implicitly by form, all the editor options are passed through this option.
 * Не использовать явно.
 * */

export default {
    create(viewClass: Marionette.View | Marionette.CollectionView | Marionette.CompositeView) {
        return {
            classes: {
                disabled: 'editor_disabled',
                readonly: 'editor_readonly',
                hidden: 'editor_hidden',
                FOCUSED: 'editor_focused',
                EMPTY: 'editor_empty'
            },

            hasFocus: false,

            constructor(options: Object = {}) {
                _.bindAll(this, 'onFocus', 'onBlur', 'checkChange', 'onKeyup');

                //Set initial value
                if (options.model) {
                    this.model = options.model;
                    this.value = this.model.get(options.key);
                } else if (options.value !== undefined) {
                    this.value = options.value;
                }

                if (this.value === undefined) {
                    this.value = null;
                }

                this.key = options.key;
                this.form = options.form;
                this.field = options.field;

                const schema = (this.schema = options.schema || {});

                this.validators = options.validators || schema.validators;
                this.__validatedOnce = false;

                this.on('render', onRender.bind(this));
                this.on('change', onChange.bind(this));
                this.setValue = _.wrap(this.setValue, (fn, ...rest) => {
                    fn.call(this, ...rest);
                    if (this.$el) {
                        this.__updateEmpty();
                    }
                });

                schema.autocommit = schema.autocommit || options.autocommit;

                this.enabled = schema.enabled = schema.enabled || options.enabled || (schema.enabled === undefined && options.enabled === undefined);
                this.readonly = schema.readonly = schema.readonly || options.readonly || (schema.readonly !== undefined && options.readonly !== undefined);
                this.hidden = schema.hidden = schema.hidden || options.hidden || (schema.hidden !== undefined && options.hidden !== undefined);
                schema.forceCommit = options.forceCommit || schema.forceCommit;

                viewClass.prototype.constructor.apply(this, arguments);
                if (this.model) {
                    this.listenTo(this.model, `change:${this.key}`, this.updateValue);
                    this.listenTo(this.model, 'sync', this.updateValue);
                    this.listenTo(this.model, 'validate:force', (e = {}) => {
                        if (this.field) {
                            e.validationResult = this.field.validate();
                        } else {
                            e.validationResult = this.validate();
                        }
                    });
                }
            },

            __updateEmpty(isEmpty = this.isEmptyValue()) {
                this.$el.toggleClass(classes.EMPTY, isEmpty);
            },

            /**
             * Manually updated editor's internal value with the value from <code>this.model.get(this.key)</code>.
             * Shouldn't be called normally. The method is called internally on model's <code>change</code> event.
             * */
            updateValue(model, value, options) {
                if (options.isEditorSetValue) {
                    return;
                }
                this.setValue(this.getModelValue());
            },

            /**
             * Retrieves actual value of the bound attribute from the model.
             * @return {*}
             * */
            getModelValue() {
                return !this.model ? undefined : this.model.get(this.key);
            },

            __getFocusElement() {
                if (this.focusElement) {
                    return this.$el.find(this.focusElement);
                }
                return this.$el;
            },

            __triggerChange(...args: Array<any>) {
                this.trigger('change', this, ...args);
            },

            /**
             * Returns internal editor's value.
             * @return {*}
             */
            getValue() {
                return this.value;
            },

            /**
             * Sets new internal editor's value.
             * @param {*} value The new value.
             */
            setValue(value: Number | String) {
                this.value = value;
            },

            setPermissions(enabled: Boolean, readonly: Boolean) {
                this.__setEnabled(enabled);
                this.__setReadonly(readonly);
            },

            /**
             * Sets a new value of <code>enabled</code> flag. While disabled, the editor's value cannot be changed or copied by the user.
             * It's implied that the value doesn't make sense.
             * @param {Boolean} enabled New flag value.
             */
            setEnabled(enabled: Boolean) {
                const readonly = this.getReadonly();
                this.setPermissions(enabled, readonly);
            },

            /**
             * Sets a new value of <code>readonly</code> flag. While readonly, the editor's value cannot be changed but can be copied by the user.
             * @param {Boolean} readonly New flag value.
             */
            setReadonly(readonly: Boolean) {
                const enabled = this.getEnabled();
                this.setPermissions(enabled, readonly);
            },

            /**
             * Sets a new value of <code>hidden</code> flag.
             * @param {Boolean} hidden New flag value.
             */
            setHidden(hidden: Boolean) {
                this.hidden = hidden;
                this.$el.toggleClass(classes.hidden, hidden);
            },

            __setEnabled(enabled: Boolean) {
                this.enabled = enabled;
                this.trigger('enabled', enabled);
                if (!this.enabled) {
                    this.$el.addClass(classes.disabled);
                } else {
                    this.$el.removeClass(classes.disabled);
                }
            },

            /**
             * Returns the value of `enabled` flag.
             * @return {Boolean}
             */
            getEnabled() {
                return this.enabled;
            },

            /**
             * Returns the value of `enabled` flag.
             * @return {Boolean}
             */
            getHidden() {
                return this.hidden;
            },

            __setReadonly(readonly: Boolean) {
                this.readonly = readonly;
                this.trigger('readonly', readonly);
                if (this.readonly && this.getEnabled()) {
                    this.$el.addClass(classes.readonly);
                } else {
                    this.$el.removeClass(classes.readonly);
                }
            },

            /**
             * Returns the value of `readonly` flag.
             * @return {Boolean}
             */
            getReadonly() {
                return this.readonly;
            },

            getEditable() {
                return this.getEnabled() && !this.getReadonly();
            },

            /**
             * Sets the focus onto this editor.
             */
            focus() {
                this.__getFocusElement().focus();
                this.hasFocus = true;
            },

            /**
             * Clears the focus.
             */
            blur() {
                this.__getFocusElement().blur();
                this.hasFocus = false;
            },

            /**
             * Update the model with the internal editor's value.
             * @param {Object} [options] Options to pass to model.set().
             * @param {Boolean} [options.validate] Set to true to trigger built-in model validation.
             * @return {Object|undefined} Returns an error object <code>{ type, message }</code> if validation fails
             * and <code>options.forceCommit</code> is turned off. <code>undefined</code> otherwise.
             */
            commit(options: Object = {}) {
                let error = this.validate(true);
                if (error && !this.schema.forceCommit) {
                    return error;
                }

                this.listenToOnce(this.model, 'invalid', (model, e) => {
                    error = e;
                });

                this.model.set(this.key, this.getValue(), {
                    silent: false,
                    validate: options.validate === true,
                    isEditorSetValue: true
                });

                if (error && !this.schema.forceCommit) {
                    return error;
                }
                this.trigger(`${this.key}:committed`, this, this.model, this.getValue());
                this.trigger('value:committed', this, this.model, this.key, this.getValue());
            },
            isEmptyValue() {
                return !this.getValue();
            },

            /**
             * Check validity with built-in validator functions (initially passed into constructor options).
             * @return {Object|undefined} Returns an error object <code>{ type, message }</code> if validation fails. <code>undefined</code> otherwise.
             */
            validate(internal: Boolean) {
                let error = null;
                const value = this.getValue();
                const formValues = this.form ? this.form.getValue() : {};
                const validators = this.validators;
                const getValidator = this.getValidator;

                if (!internal) {
                    this.__validatedOnce = true;
                }

                if (validators) {
                    //Run through validators until an error is found
                    validators.every(validator => {
                        error = getValidator(validator)(value, formValues);
                        return !error;
                    });
                }

                if (this.isRendered() && !this.isDestroyed()) {
                    this.$el.toggleClass(classes.ERROR, !!error);
                }

                return error;
            },

            trigger(event: 'focus' | 'blur') {
                if (event === 'focus') {
                    this.hasFocus = true;
                } else if (event === 'blur') {
                    this.hasFocus = false;
                }

                return Marionette.View.prototype.trigger.apply(this, arguments);
            },

            getValidator(validator: string | Function) {
                const validators = formRepository.validators;

                //Convert regular expressions to validators
                if (_.isRegExp(validator)) {
                    return validators.regexp({ regexp: validator });
                }

                //Use a built-in validator if given a string
                if (typeof validator === 'string') {
                    if (!validators[validator]) {
                        throw new Error(`Validator "${validator}" not found`);
                    }

                    return validators[validator]();
                }

                //Functions can be used directly
                if (typeof validator === 'function') {
                    return validator;
                }

                //Use a customised built-in validator if given an object
                //noinspection JSUnresolvedVariable
                if (_.isObject(validator) && validator.type) {
                    const config = validator;

                    //noinspection JSUnresolvedVariable
                    return validators[config.type](config);
                }

                //Unknown validator type
                throw new Error('Invalid validator');
            },

            checkChange() {
                if (this.model) {
                    if (this.value !== this.model.get(this.key)) {
                        this.__triggerChange();
                    }
                }
            },

            onKeyup(event) {
                if (event.keyCode === keyCode.ENTER) {
                    this.checkChange();
                }
            },

            onFocus(event, options) {
                this.$el.addClass(classes.FOCUSED);
                //ToDo what for pass 'this' as first argument ?
                this.trigger('focus', this, event, options);
            },

            onBlur(event, options = {}) {
                if (options.triggerChange === undefined || options.triggerChange === true) {
                    this.checkChange();
                }
                this.$el.removeClass(classes.FOCUSED);
                this.trigger('blur', this, event, options);
            },

            renderIcons(...iconTemplates) {
                this.el.insertAdjacentHTML('beforeend', iconTemplates.join(' '));
            }
        };
    }
};
