/**
 * Backbone Forms v0.14.0
 *
 * Copyright (c) 2013 Charles Davison, Pow Media Ltd
 *
 * License and more information at:
 * http://github.com/powmedia/backbone-forms
 */
;(function (root) {

    //DEPENDENCIES
    //CommonJS
    if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
        var $ = root.jQuery || root.Zepto || root.ender || require('jquery'),
            _ = root._ || require('underscore'),
            Backbone = root.Backbone || require('backbone');
        Backbone.$ = $;
    }

    //Browser
    else {
        var $ = root.jQuery,
            _ = root._,
            Backbone = root.Backbone;
    }


    //SOURCE
    //==================================================================================================
//FORM
//==================================================================================================

    var templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    var Form = Backbone.View.extend({

        events: {
            'submit': function (event) {
                this.trigger('submit', event);
            }
        },

        /**
         * Constructor
         *
         * @param {Object} [options.schema]
         * @param {Backbone.Model} [options.model]
         */
        initialize: function (options) {
            var self = this;

            options = options || {};

            var schema = this.schema = _.result(options, 'schema');

            this.Field = this.Field || Form.Field;

            //Check which fields will be included (defaults to all)

            //Create fields
            var fields = this.fields = {};

            var fieldKeys = _.keys(schema);
            _.each(fieldKeys, function (key) {
                var field = new this.Field({
                    form: this,
                    key: key,
                    schema: schema[key],
                    model: this.model
                });
                this.listenTo(field.editor, 'all', this.handleEditorEvent);
                fields[key] = field;
            }, this);
        },

        /**
         * Update the model with all latest values.
         *
         * @param {Object} [options]  Options to pass to Model#set (e.g. { silent: true })
         *
         * @return {Object}  Validation errors
         */
        commit: function (options) {
            //Validate
            options = options || {};

            var validateOptions = {
                skipModelValidate: !options.validate
            };

            var errors = this.validate(validateOptions);
            if (errors) return errors;

            //Commit
            var modelError;

            var setOptions = _.extend({
                error: function (model, e) {
                    modelError = e;
                }
            }, options);

            this.model.set(this.getValue(), setOptions);

            if (modelError) return modelError;
        },

        /**
         * Get all the field values as an object.
         * Use this method when passing data instead of objects
         *
         * @param {String} [key]    Specific field value to get
         */
        getValue: function (key) {
            //Return only given key if specified
            if (key) return this.fields[key].getValue();

            //Otherwise return entire form
            var values = {};
            _.each(this.fields, function (field) {
                values[field.key] = field.getValue();
            });

            return values;
        },

        /**
         * Update field values, referenced by key
         *
         * @param {Object|String} key     New values to set, or property to set
         * @param val                     Value to set
         */
        setValue: function (prop, val) {
            var data = {};
            if (typeof prop === 'string') {
                data[prop] = val;
            } else {
                data = prop;
            }

            var key;
            for (key in this.schema) {
                if (data[key] !== undefined) {
                    this.fields[key].setValue(data[key]);
                }
            }
        },

        /**
         * Returns the editor for a given field key
         *
         * @param {String} key
         *
         * @return {Editor}
         */
        getEditor: function (key) {
            var field = this.fields[key];
            if (!field) throw new Error('Field not found: ' + key);

            return field.editor;
        },

        /**
         * Gives the first editor in the form focus
         */
        focus: function () {
            if (this.hasFocus) {
                return;
            }

            var field = this.fields[0];
            if (!field) {
                return;
            }

            field.editor.focus();
        },

        /**
         * Removes focus from the currently focused editor
         */
        blur: function () {
            if (!this.hasFocus) {
                return;
            }

            var focusedField = _.find(this.fields, function (field) {
                return field.editor.hasFocus;
            });

            if (focusedField) focusedField.editor.blur();
        },

        /**
         * Manages the hasFocus property
         *
         * @param {String} event
         */
        trigger: function (event) {
            if (event === 'focus') {
                this.hasFocus = true;
            }
            else if (event === 'blur') {
                this.hasFocus = false;
            }

            return Backbone.View.prototype.trigger.apply(this, arguments);
        },

        /**
         * Override default remove function in order to remove embedded views
         *
         * TODO: If editors are included directly with data-editors="x", they need to be removed
         * May be best to use XView to manage adding/removing views
         */
        remove: function () {
            _.each(this.fields, function (field) {
                field.remove();
            });
            return Backbone.View.prototype.remove.apply(this, arguments);
        }
    }, {
        templateSettings: templateSettings,

        editors: {},

        validators: {}
    });

//==================================================================================================
//FIELD
//==================================================================================================

    Form.Field = Backbone.View.extend({

        /**
         * Constructor
         *
         * @param {Object} options.key
         * @param {Object} options.form
         * @param {Object} [options.schema]
         * @param {Backbone.Model} [options.model]
         * @param {Object} [options.value]
         */
        initialize: function (options) {
            options = options || {};

            _.extend(this, _.pick(options, 'form', 'key', 'model', 'value'));

            this.schema = this.__createSchema(options.schema);
            this.template = this.constructor.template;
            this.errorClassName = this.constructor.errorClassName;

            this.editor = this.__createEditor();
        },

        __createSchema: function (schema) {
            //Set defaults
            schema = _.extend({
                type: 'Text',
                title: this.__createDefaultTitle()
            }, schema);

            //Get the real constructor function i.e. if type is a string such as 'Text'
            schema.type = _.isString(schema.type) ? Form.editors[schema.type] : schema.type;

            return schema;
        },

        __createEditor: function () {
            var ConstructorFn = this.schema.type;
            return new ConstructorFn(_.extend(
                _.pick(this, 'schema', 'form', 'key', 'model', 'value'), {
                    id: this.__createEditorId()
                }
            ));
        },

        __createEditorId: function () {
            var prefix = this.idPrefix,
                id = this.key;

            //Replace periods with underscores (e.g. for when using paths)
            id = id.replace(/\./g, '_');

            //If a specific ID prefix is set, use it
            if (_.isString(prefix) || _.isNumber(prefix)) return prefix + id;
            if (_.isNull(prefix)) return id;

            //Otherwise, if there is a model use it's CID to avoid conflicts when multiple forms are on the page
            if (this.model) return this.model.cid + '_' + id;

            return id;
        },

        /*
         * Create the default field title (label text) from the key name.
         * (Converts 'camelCase' to 'Camel Case')
         */
        __createDefaultTitle: function () {
            var str = this.key;
            if (!str) {
                return '';
            }

            //Add spaces
            str = str.replace(/([A-Z])/g, ' $1');

            //Uppercase first character
            str = str.replace(/^./, function(str) { return str.toUpperCase(); });

            return str;
        },

        /**
         * Returns the data to be passed to the template
         *
         * @return {Object}
         */
        templateData: function () {
            var schema = this.schema;

            return {
                help: schema.help || '',
                title: schema.title,
                key: this.key,
                editorId: this.editor.id
            };
        },

        /**
         * Render the field and editor
         *
         * @return {Field} self
         */
        render: function () {
            //Render field
            var $field = $($.trim(this.template(_.result(this, 'templateData'))));

            //Render editor
            $field.find('[data-editor]').add($field).each(function (i, el) {
                var $container = $(el),
                    selection = $container.attr('data-editor');

                if (_.isUndefined(selection)) return;

                $container.append(this.editor.render().el);
            }.bind(this));

            this.setElement($field);

            return this;
        },

        /**
         * Update the model with the new value from the editor
         *
         * @return {Mixed}
         */
        commit: function () {
            return this.editor.commit();
        },

        /**
         * Get the value from the editor
         *
         * @return {Mixed}
         */
        getValue: function () {
            return this.editor.getValue();
        },

        /**
         * Set/change the value of the editor
         *
         * @param {Mixed} value
         */
        setValue: function (value) {
            this.editor.setValue(value);
        },

        /**
         * Give the editor focus
         */
        focus: function () {
            this.editor.focus();
        },

        /**
         * Remove focus from the editor
         */
        blur: function () {
            this.editor.blur();
        },

        /**
         * Remove the field and editor views
         */
        remove: function () {
            this.editor.remove();
            Backbone.View.prototype.remove.call(this);
        }
    });

    //Metadata
    Form.VERSION = '0.14.0.modified';

    //Exports
    Backbone.Form = Form;
    if (typeof module !== 'undefined') module.exports = Form;

})(window || global || this);
