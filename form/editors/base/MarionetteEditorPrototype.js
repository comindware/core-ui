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
            readonly: 'l-field_readonly',
            FOCUSED: 'l-field_focused'
        };

        var onFocus = function () {
            this.$el.addClass(classes.FOCUSED);
            this.trigger('focus', this);
        };

        var onBlur = function () {
            this.$el.removeClass(classes.FOCUSED);
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

        /**
         * @name BaseEditorView
         * @memberof module:core.form.editors.base
         * @class Базовый класс для всех эдиторов. Является модификацией класса Backbone.Form.Editor из библиотеки Backbone.Form.<br/>
         * При реализации собственных эдиторов используйте один из следующих классов, наследующих этот:<ul>
         * <li><code>BaseCollectionEditorView</code></li>
         * <li><code>BaseCompositeEditorView</code></li>
         * <li><code>BaseLayoutEditorView</code></li>
         * <li><code>BaseItemEditorView</code></li></ul>
         * Возможные эвенты:<ul>
         * <li><code>'change' (thisEditorView)</code> - эвент возникает при изменении значения value внутри эдитора.
         * При этом эвент не означает изменение значения в модели (!).</li>
         * <li><code>'focus' (thisEditorView)</code> - эвент возникает при получении эдитором фокуса.</li>
         * <li><code>'blur' (thisEditorView)</code> - эвент возникает при потере фокуса эдитором.</li>
         * <li><code>'enabled' (enabled)</code> - эвент возникает при изменении флага enabled.</li>
         * <li><code>'readonly' (readonly)</code> - эвент возникает при изменении флага readonly.</li>
         * <li><code>'&lt;key&gt;:committed' (thisEditorView, model, value)</code> - эвент возникает при записи данных в модель.</li>
         * <li><code>'value:committed' (thisEditorView, model, key, value)</code> - эвент возникает при записи данных в модель.</li>
         * </ul>
         * @constructor
         * @extends Marionette.View
         * @param {Object} options Объект опций.
         * @param {Boolean} [options.autocommit=false] Автоматически вызывать метод commit() при каждом изменении значения value.
         * @param {Boolean} [options.forceCommit=false] Делать commit в модель даже в случае ошибок валидации (не рекомендуется).
         * @param {Boolean} [options.enabled=true] Значение enabled, установленное по умолчанию (в дальнейшем возможно изменить через метод setEnabled).
         * @param {Boolean} [options.readonly=false] Значение readonly, установленное по умолчанию (в дальнейшем возможно изменить через метод setReadonly).
         * @param {Boolean} [options.model] Редактируемая модель. Используется только при создании в отвязке от формы, вместе с опцией <code>key</code>.
         * @param {Boolean} [options.key] Редактируемый атрибут. Используется только при создании в отвязке от формы, вместе с опцией <code>model</code>.
         * @param {Function[]} [options.validators] Массив функций-валидаторов с сигнатурой:
         * <code>function(value, formValues) -> ({type, message}|undefined)</code>
         * @param {Object} [options.schema] Используется для передачи опций в эдитор в случае его неявного создания через форму (Backbone.Form).
         * Не использовать явно.
         * */

        return {
            create: function(viewClass) {
                return /** @lends module:core.form.editors.base.BaseEditorView.prototype */ {
                    defaultValue: null,

                    /**
                     * Флаг, определяющий активен ли на эдиторе фокус в настоящее время.
                     * */
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

                        this.enabled = schema.enabled = schema.enabled || options.enabled ||
                                      (schema.enabled === undefined && options.enabled === undefined);
                        this.readonly = schema.readonly = schema.readonly || options.readonly ||
                                       (schema.readonly !== undefined && options.readonly !== undefined);
                        schema.forceCommit = options.forceCommit || schema.forceCommit;

                        viewClass.prototype.constructor.apply(this, arguments);
                        if (this.model) {
                            this.listenTo(this.model, 'change:' + this.key, this.updateValue);
                            this.listenTo(this.model, 'sync', this.updateValue);
                        }

                        this.classes = classes;
                    },

                    /**
                     * Ручное обновление значения эдитора значением this.model.get(this.key). Обычно вызывается автоматически по эвенту
                     * <code>'change'</code> модели.
                     * */
                    updateValue: function () {
                        this.setValue(this.getModelValue());
                    },

                    /**
                     * Получить текущее значение из модели.
                     * */
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
                        this.trigger.apply(this, [ 'change', this].concat(arguments));
                    },

                    getName: function() {
                        var key = this.key || '';

                        //Replace periods with underscores (e.g. for when using paths)
                        return key.replace(/\./g, '_');
                    },

                    /**
                     * Получить внутреннее значение эдитора.
                     * @return {*}
                     */
                    getValue: function() {
                        return this.value;
                    },

                    /**
                     * Установить новое внутреннее значение эдитора.
                     * @param {*} value Новое значение.
                     */
                    setValue: function(value) {
                        this.value = value;
                    },

                    setPermissions: function (enabled, readonly) {
                        this.__setEnabled(enabled);
                        this.__setReadonly(readonly);
                    },

                    /**
                     * Установить новое значение флага enabled. В disabled состоянии эдитор невозможно редактировать,
                     * а также невозможно скопировать его текущее значение (считается, что для пользователя оно не имеет смысла).
                     * @param {Boolean} enabled Новое значение флага.
                     */
                    setEnabled: function (enabled) {
                        var readonly = this.getReadonly();
                        this.setPermissions(enabled, readonly);
                    },

                    /**
                     * Установить новое значение флага readonly. В readonly состоянии эдитор невозможно редактировать,
                     * но возможно выделить и скопировать его текущее значение в текстовом виде.
                     * @param {Boolean} readonly Новое значение флага.
                     */
                    setReadonly: function (readonly) {
                        var enabled = this.getEnabled();
                        this.setPermissions(enabled, readonly);
                    },

                    __setEnabled: function (enabled) {
                        this.enabled = enabled;
                        this.trigger('enabled', enabled);
                        if (!this.enabled) {
                            this.$el.addClass(classes.disabled);
                        } else {
                            this.$el.removeClass(classes.disabled);
                        }
                    },

                    /**
                     * Получить значение флага enabled
                     */
                    getEnabled: function () {
                        return this.enabled;
                    },

                    __setReadonly: function (readonly) {
                        this.readonly = readonly;
                        this.trigger('readonly', readonly);
                        if (this.readonly && this.getEnabled()) {
                            this.$el.addClass(classes.readonly);
                        } else {
                            this.$el.removeClass(classes.readonly);
                        }
                    },

                    /**
                     * Получить значение флага readonly
                     */
                    getReadonly: function () {
                        return this.readonly;
                    },

                    /**
                     * Установить фокус на этот эдитор.
                     */
                    focus: function() {
                        if (this.hasFocus) {
                            return;
                        }
                        this.__getFocusElement().focus();
                    },

                    /**
                     * Снять фокус с данного эдитора.
                     */
                    blur: function() {
                        if (!this.hasFocus) {
                            return;
                        }
                        this.__getFocusElement().blur();
                    },

                    /**
                     * Update the model with the current value
                     * @param {Object} [options] Options to pass to model.set()
                     * @param {Boolean} [options.validate] Set to true to trigger built-in model validation
                     * @return {Object|undefined} В случае ошибки, возвращает объект <code>{ type, message }</code>.
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
                     * Check validity with built-in validator functions (initially passed into constructor options).
                     * @return {Object|undefined} В случае ошибки, возвращает объект <code>{ type, message }</code>.
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

                    trigger: function(event) {
                        if (event === 'focus') {
                            this.hasFocus = true;
                        }
                        else if (event === 'blur') {
                            this.hasFocus = false;
                        }

                        return Marionette.ItemView.prototype.trigger.apply(this, arguments);
                    },

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
