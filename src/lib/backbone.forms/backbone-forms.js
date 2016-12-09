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
            options = options || {};

            var schema = this.schema = _.result(options, 'schema');

            //Create fields
            var fields = this.fields = {};

            _.each(schema, function (fieldSchema, key) {
                var field = new this.Field({
                    form: this,
                    key: key,
                    schema: fieldSchema,
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

    //Metadata
    Form.VERSION = '0.14.0.modified';

    //Exports
    Backbone.Form = Form;
    if (typeof module !== 'undefined') module.exports = Form;

})(window || global || this);
