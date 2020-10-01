import formRepository from '../../formRepository';
import dropdown from 'dropdown';
import ErrorButtonView from '../../../views/ErrorButtonView';
import InfoButtonView from '../../../views/InfoButtonView';
import TooltipPanelView from '../../../views/TooltipPanelView';
import ErrorsPanelView from '../../../views/ErrorsPanelView';
import Backbone from 'backbone';
import _ from 'underscore';
import Marionette from 'backbone.marionette';
import { keyCode } from 'utils';

const classes = {
    editorDisabled: 'editor_disabled',
    disabled: 'disabled',
    readonly: 'readonly',
    editorReadonly: 'editor_readonly',
    hidden: 'editor_hidden',
    FOCUSED: 'editor_focused',
    EMPTY: 'editor_empty',
    ERROR: 'editor_error error',
    REQUIRED: 'required'
};

const onRender = function() {
    this.setValue(this.value);
    if (this.focusElement) {
        this.$editorEl.on('focus', this.focusElement, this.onFocus);
        this.$editorEl.on('blur', this.focusElement, this.onBlur);
        this.$editorEl.on('keyup', this.focusElement, this.onKeyup);
    } else if (this.focusElement !== null) {
        this.$editorEl.on('focus', this.onFocus);
        this.$editorEl.on('blur', this.onBlur);
        this.$editorEl.on('keyup', this.onKeyup);
    }

    if (this.enabled) {
        this.__setReadonlyFocusElement(this.readonly);
    } else {
        this.__setEnabledFocusElement(this.enabled);
    }

    // revalidate if model isInvalid
    if (this.model && this.model.validationResult) {
        this.validate();
    }
};

const onChange = function() {
    if (this.model && this.options.autocommit) {
        this.commit();
    }
    if (this.hasErrors()) {
        if (this.form) {
            this.form.validate();
        } else {
            this.validate();
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
 * */

const defaultOptions = {
    autocommit: false,
    enabled: true,
    readonly: false,
    hidden: false,
    forceCommit: false,
    validators: undefined,
    getFocusElementReadonly: (readonly: boolean) => readonly,
    getFocusElementTabindex: (readonly: boolean) => (readonly ? -1 : 0)
};

export default function(viewClass: Marionette.View | Marionette.CollectionView) {
    return {
        classes,

        hasFocus: false,

        constructor(options: Object = {}) {
            this.onFocus = this.onFocus.bind(this);
            this.onBlur = this.onBlur.bind(this);
            this.checkChange = this.checkChange.bind(this);
            this.onKeyup = this.onKeyup.bind(this);

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

            this.__hasErrors = false;

            this.on('render', this.__onEditorRender.bind(this));
            this.on('change', onChange.bind(this));
            this.on('before:attach', this.__onBeforeAttach);
            this.on('destroy', this.__onDestroy);

            const fn = this.setValue;
            this.setValue = function() {
                fn.apply(this, arguments);
                if (this.$editorEl) {
                    this.__updateEmpty();
                }
            };

            this.options = _.defaults({}, options, defaultOptions, this.options);

            this.validators = this.options.validators;
            this.enabled = this.options.enabled;
            this.readonly = this.options.readonly;
            this.hidden = this.options.hidden;

            this.isField = this.options.isField;

            viewClass.prototype.constructor.apply(this, arguments);

            const isEmpty = this.isEmptyValue();

            const classState = {
                disabled: !this.enabled,
                editorDisabled: !this.enabled,
                readonly: this.readonly,
                editorReadonly: this.readonly,
                hidden: this.hidden,
                EMPTY: isEmpty,
                REQUIRED: this.options.required && isEmpty
            };

            const classList = Object.entries(classes).reduce((classesList, [key, classString]) => {
                if (classState[key]) {
                    classesList.push(...classString.split(' '));
                }
                return classesList;
            }, []);

            if (classList.length) {
                this.editorEl.classList.add(...classList);
            }

            if (this.id) {
                this.editorEl.setAttribute('id', this.id);
            }

            if (this.model) {
                this.listenTo(this.model, `change:${this.key}`, this.updateValue);
                this.listenTo(this.model, 'sync', this.updateValue);
                this.listenTo(this.model, 'validate:force', (e = {}) => {
                    const validationResult = this.validate();
                    if (validationResult) {
                        e.validationResult = validationResult;
                    }
                });
                if (options.getReadonly || options.getHidden) {
                    this.model.on('change', () => this.__updateDynamicFieldAccess(options));
                    this.once('render', () => this.__updateDynamicFieldAccess(options));
                }
            }
        },

        _ensureElement() {
            if (this.el) {
                this.setElement(_.result(this, 'el'));
                return;
            }

            if (this.isField) {
                const { attributes, className, tagName = 'div', fieldId: id, title, showLabel } = this.options.fieldOptions;
                this.fieldEl = this._createElement(tagName);
                this.__setAttributes(this.fieldEl, {
                    ...attributes,
                    class: className,
                    id
                });
                if (showLabel) {
                    const labelHtml = `<label class="form-label__txt" title="${title || ''}" for="${this.options.fieldId}">${title || ''}</label>`;
                    this.fieldEl.insertAdjacentHTML(
                        'afterbegin',
                        `<div class="form-label ${title ? '' : 'form-label--empty'}">
                            ${labelHtml}
                        </div>`
                    );
                }
                this.editorEl = this._createElement(this.tagName);
                this.$editorEl = Backbone.$(this.editorEl);
                var attrs = { ..._.result(this, 'attributes') };
                if (this.id) {
                    attrs.id = _.result(this, 'id');
                }
                if (this.className) {
                    attrs['class'] = _.result(this, 'className');
                }
                this.fieldEl.insertAdjacentElement('beforeend', this.editorEl);
                this.__setAttributes(this.editorEl, attrs);
                this.setElement(this.fieldEl);
            } else {
                var attrs = _.extend({}, _.result(this, 'attributes'));
                if (this.id) {
                    attrs.id = _.result(this, 'id');
                }
                if (this.className) {
                    attrs['class'] = _.result(this, 'className');
                }
                this.editorEl = this._createElement(_.result(this, 'tagName'));
                this.$editorEl = Backbone.$(this.editorEl);
                this.setElement(this.editorEl);
                this._setAttributes(attrs);
            }
        },

        setElement(element: HTMLElement) {
            this.undelegateEvents();
            this._setElement(this.editorEl);
            this.delegateEvents();
            this._setElement(element);
            return this;
        },

        _renderTemplate(template: Function) {
            const data = this.mixinTemplateContext(this.serializeData()) || {};
            const html = this._renderHtml(template, data);
            this.editorEl.innerHTML = html;
        },

        __setAttributes(el: HTMLElement, attributes: Object = {}) {
            Object.entries(attributes).forEach(([key, value]) => {
                if (value) {
                    el.setAttribute(key, value);
                }
            });
        },

        __onEditorRender: onRender,

        __updateEmpty(isEmpty = this.isEmptyValue()) {
            if (this.options.required) {
                this.__toggleRequiredClass(isEmpty);
            }
            this.$editorEl.toggleClass(classes.EMPTY, Boolean(isEmpty));
        },

        __toggleRequiredClass(required) {
            this.$el.toggleClass(this.classes.REQUIRED, Boolean(required));
        },

        __applyOptions(options, defaults) {
            this.__applyDefaults(options, defaults);
            this.__applyClass();
        },

        __applyDefaults(options, defaults) {
            const defOps = typeof defaults === 'function' ? defaults(options) : defaults;
            this.options = _.defaults({}, options, defOps, this.options);
        },

        __applyClass() {
            if (this.options.class) {
                this.editorEl.classList.add(...this.options.class.split(' ').filter(className => className));
            }
        },

        setRequired(required = this.options.required) {
            this.options.required = required;
            if (required) {
                this.__updateEmpty();
            } else {
                this.__toggleRequiredClass(false);
            }
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
            this.validate({ internal: true });
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
                return this.__focusElement || (this.__focusElement = this.$editorEl.find(this.focusElement));
            }
            return this.$editorEl;
        },

        __setEnabledFocusElement(enabled: boolean): void {
            if (this.focusElement === null) {
                return;
            }
            this.__getFocusElement().prop('disabled', !enabled);
        },

        __setReadonlyFocusElement(readonly: boolean): void {
            if (this.focusElement === null) {
                return;
            }
            if (this.getEnabled()) {
                const focusElement = this.__getFocusElement();
                focusElement.prop('readonly', this.options.getFocusElementReadonly(readonly));
                focusElement.prop('tabindex', this.options.getFocusElementTabindex(readonly));
            }
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
            this.$editorEl.toggleClass(classes.hidden, hidden);
        },

        __setEnabled(enabled: Boolean) {
            this.enabled = enabled;
            this.__setEnabledFocusElement(enabled);
            if (!this.enabled) {
                this.editorEl.classList.add(classes.disabled, classes.editorDisabled);
            } else {
                this.editorEl.classList.remove(classes.disabled, classes.editorDisabled);
            }
            this.trigger('enabled', enabled);
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
            this.__setReadonlyFocusElement(readonly);
            if (this.readonly && this.getEnabled()) {
                this.editorEl.classList.add(classes.readonly, classes.editorReadonly);
            } else {
                this.editorEl.classList.remove(classes.readonly, classes.editorReadonly);
            }
            this.trigger('readonly', readonly);
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
            //TODO if focusElement === null ?
            this.__getFocusElement().get(0).focus();
            this.hasFocus = true;
        },

        /**
         * Clears the focus.
         */
        blur() {
            //TODO if focusElement === null ?
            this.__getFocusElement().get(0).blur();
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
            let error = this.validate({ internal: true });
            if (error && !this.options.forceCommit) {
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

            if (error && !this.options.forceCommit) {
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
        validate({ internal } = {}) {
            const errors: Array<Object> = [];
            const value = this.getValue();
            const formValues = this.form ? this.form.getValue() : {};
            const validators = this.validators;

            if (!validators) { 
                return;
            }

            validators.forEach(validatorOptions => {
                const validator = formRepository.getValidator(validatorOptions);
                const error = validator.call(this, value, formValues);
                if (error) {
                    errors.push(error);
                }
            });

            if (this.isRendered() && !this.isDestroyed()) {
                this.$editorEl.toggleClass(classes.ERROR, !!errors.length);
                if (errors.length) {
                    this.setError(errors);
                } else {
                    this.clearError();
                }
            }

            return errors.length ? errors : undefined;
        },

        trigger(event: 'focus' | 'blur') {
            if (event === 'focus') {
                this.hasFocus = true;
            } else if (event === 'blur') {
                this.hasFocus = false;
            }

            return Marionette.View.prototype.trigger.apply(this, arguments);
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
            this.editorEl.classList.add(classes.FOCUSED);
            //ToDo what for pass 'this' as first argument ?
            this.trigger('focus', this, event, options);
        },

        onBlur(event, options = {}) {
            if (options.triggerChange === undefined || options.triggerChange === true) {
                this.checkChange();
            }
            this.editorEl.classList.remove(classes.FOCUSED);
            this.trigger('blur', this, event, options);
        },

        renderIcons(...iconTemplates) {
            this.editorEl.insertAdjacentHTML('beforeend', iconTemplates.join(' '));
        },

        __onBeforeAttach() {
            if (this.isField && this.options.fieldOptions.helpText && this.options.fieldOptions.showHelpText) {
                const viewModel = new Backbone.Model({
                    helpText: this.options.helpText,
                    errorText: null
                });

                const infoPopout = dropdown.factory.createPopout({
                    buttonView: InfoButtonView,
                    panelView: TooltipPanelView,
                    panelViewOptions: {
                        model: viewModel,
                        textAttribute: 'helpText'
                    },
                    popoutFlow: 'right',
                    customAnchor: true
                });

                if (!this.el.querySelector('.js-help-text-region')) {
                    this.el.firstElementChild.insertAdjacentHTML('beforeend', `<div class="js-help-text-region form-label__info"></div>`);
                }

                this.helpTextRegion = new Marionette.Region({
                    el: this.el.querySelector('.js-help-text-region')
                });
                this.helpTextRegion.show(infoPopout);
            }
        },

        __onDestroy() {
            this.helpTextRegion?.destroy();
            this.errorsRegion?.destroy();
        },

        setError(errors: Array<any>): void {
            this.__hasErrors = true;
            if (!this.__checkUiReady() || !this.isField) {
                return;
            }

            this.el.classList.add(...this.classes.ERROR.split(' '));
            this.errorCollection ? this.errorCollection.reset(errors) : (this.errorCollection = new Backbone.Collection(errors));

            if (!this.isErrorShown) {
                const errorPopout = dropdown.factory.createPopout({
                    buttonView: ErrorButtonView,
                    panelView: ErrorsPanelView,
                    panelViewOptions: {
                        collection: this.errorCollection
                    },
                    popoutFlow: 'right',
                    customAnchor: true
                });

                this.el.firstElementChild.insertAdjacentHTML('beforeend', `<div class="js-error-text-region form-label__error"></div>`);
                this.errorsRegion = new Marionette.Region({
                    el: this.el.querySelector('.js-error-text-region')
                });

                this.errorsRegion.show(errorPopout);
                this.isErrorShown = true;
            }
        },

        clearError(): void {
            this.__hasErrors = false;
            if (!this.__checkUiReady() || !this.isField) {
                return;
            }
            this.el.classList.remove(...this.classes.ERROR.split(' '));
            this.errorCollection && this.errorCollection.reset();
        },

        hasErrors(): boolean {
            return this.__hasErrors;
        },

        __checkUiReady() {
            return this.isRendered() && !this.isDestroyed();
        },

        __updateDynamicFieldAccess(options) {
            if (typeof options.getReadonly === 'function') {
                this.setReadonly(Boolean(options.getReadonly(options.model)));
            }
            if (typeof options.getHidden === 'function') {
                this.setHidden(Boolean(options.getHidden(options.model)));
            }
        }
    };
}
