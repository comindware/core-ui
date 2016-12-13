/**
 * Developer: Stepan Burguchev
 * Date: 11/19/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import FieldView from '../fields/FieldView';
import helpers from '../../utils/helpers';

let Form = Marionette.Object.extend({
    /**
     * Constructor
     *
     * @param {Object} [options.schema]
     * @param {Backbone.Model} [options.model]
     */
    initialize (options) {
        this.options = options = options || {};

        this.__regionManager = new Marionette.RegionManager();
        this.schema = _.result(options, 'schema');
        this.model = options.model;

        this.fields = {};
        _.each(this.schema, function (fieldSchema, key) {
            let FieldType = fieldSchema.field || options.field || FieldView;
            let field = new FieldType({
                form: this,
                key: key,
                schema: fieldSchema,
                model: this.model
            });
            this.listenTo(field.editor, 'all', this.__handleEditorEvent);
            this.fields[key] = field;
        }, this);

        let $target = this.options.$target;

        let usedFields = {};
        //Render standalone editors
        $target.find('[data-editors]').each((i, el) => {
            let $editorRegion = $(el);
            let key = $editorRegion.attr('data-editors');
            let regionName = `${key}Region`;
            if (usedFields[key]) {
                helpers.throwFormatError(`Duplicated field '${key}'.`);
            }
            this.__regionManager.addRegion(regionName, { el: $editorRegion });
            this.__regionManager.get(regionName).show(this.fields[key].editor);
            usedFields[key] = true;
        });

        //Render standalone fields
        $target.find('[data-fields]').each((i, el) => {
            let $fieldRegion = $(el);
            let key = $fieldRegion.attr('data-fields');
            let regionName = `${key}Region`;
            if (usedFields[key]) {
                helpers.throwFormatError(`Duplicated field '${key}'.`);
            }
            this.__regionManager.addRegion(regionName, { el: $fieldRegion });
            this.__regionManager.get(regionName).show(this.fields[key]);
            usedFields[key] = true;
        });

        this.validate({
            silent: true
        });
    },

    /**
     * Update the model with all latest values.
     *
     * @param {Object} [options]  Options to pass to Model#set (e.g. { silent: true })
     *
     * @return {Object}  Validation errors
     */
    commit (options) {
        // Validate
        options = options || {};

        let errors = this.validate({
            skipModelValidate: !options.validate
        });
        if (errors) {
            return errors;
        }

        // Commit
        let modelError = null;
        let setOptions = Object.assign({
            error: function (model, e) {
                modelError = e;
            }
        }, options);

        this.model.set(this.getValue(), setOptions);
        return modelError;
    },

    /**
     * Returns the editor for a given field key
     *
     * @param {String} key
     *
     * @return {Editor}
     */
    getEditor (key) {
        let field = this.fields[key];
        if (!field) {
            throw new Error('Field not found: ' + key);
        }
        return field.editor;
    },

    onDestroy () {
        this.__regionManager.destroy();
    },

    /**
     * Get all the field values as an object.
     * @param {String} [key]    Specific field value to get
     */
    getValue (key) {
        // Return only given key if specified
        if (key) {
            return this.fields[key].getValue();
        }

        // Otherwise return entire form
        let values = {};
        _.each(this.fields, function (field) {
            values[field.key] = field.getValue();
        });

        return values;
    },

    /**
     * Update field values, referenced by key
     *
     * @param {Object|String} prop     New values to set, or property to set
     * @param val                     Value to set
     */
    setValue (prop, val) {
        let data = {};
        if (typeof prop === 'string') {
            data[prop] = val;
        } else {
            data = prop;
        }

        Object.keys(this.schema).forEach(key => {
            if (data[key] !== undefined) {
                this.fields[key].setValue(data[key]);
            }
        });
    },

    __handleEditorEvent (event, editor, field) {
        if (event !== 'validated') {
            //Re-trigger editor events on the form
            this.trigger.call(this, `form:${event}`, this, editor, Array.prototype.slice.call(arguments, 2));
        }

        switch (event) {
        case 'change':
            this.trigger('change', this, editor);
            this.trigger(`${editor.key}:change`, this, editor);
            break;
        case 'focus':
            if (!this.hasFocus) {
                this.hasFocus = true;
                this.trigger('focus', this);
            }
            break;
        case 'blur':
            if (this.hasFocus) {
                let focusedField = _.find(this.fields, f => f.editor.hasFocus);
                if (!focusedField) {
                    this.hasFocus = false;
                    this.trigger('blur', this);
                }
            }
            break;
        case 'validated':
            this.validate({
                silent: true
            });
            break;
        default:
            break;
        }
    },

    setErrors (errors) {
        _.each(errors, (value, key) => {
            let field = this.fields[key];
            if (field) {
                field.setError(value);
            }
        });
    },

    /**
     * Validate the data
     * @return {Object} Validation errors
     */
    validate (options) {
        let fields = this.fields;
        let model = this.model;
        let errors = {};

        options = options || {};

        //Collect errors from schema validation
        _.each(fields, function (field) {
            let error = field.validate(options);
            if (error) {
                errors[field.key] = error;
            }
        });

        //Get errors from default Backbone model validator
        if (!options.skipModelValidate && model && model.validate) {
            let modelErrors = model.validate(this.getValue());

            if (modelErrors) {
                let isDictionary = _.isObject(modelErrors) && !_.isArray(modelErrors);

                //If errors are not in object form then just store on the error object
                if (!isDictionary) {
                    errors._others = errors._others || [];
                    errors._others.push(modelErrors);
                }

                //Merge programmatic errors (requires model.validate() to return an object e.g. { fieldKey: 'error' })
                if (isDictionary) {
                    _.each(modelErrors, function (val, key) {
                        //Set error on field if there isn't one already
                        if (fields[key] && !errors[key]) {
                            fields[key].setError(val);
                            errors[key] = val;
                        } else {
                            //Otherwise add to '_others' key
                            errors._others = errors._others || [];
                            errors._others.push({
                                [key]: val
                            });
                        }
                    });
                }
            }
        }

        let result = _.isEmpty(errors) ? null : errors;
        this.trigger('form:validated', !result, result);
        return result;
    },

    /**
     * Gives the first editor in the form focus
     */
    focus () {
        if (this.hasFocus) {
            return;
        }

        let field = this.fields[0];
        if (!field) {
            return;
        }
        field.editor.focus();
    },

    /**
     * Removes focus from the currently focused editor
     */
    blur () {
        if (!this.hasFocus) {
            return;
        }

        let focusedField = _.find(this.fields, function (field) {
            return field.editor.hasFocus;
        });
        if (focusedField) {
            focusedField.editor.blur();
        }
    }
});

const constants = {
    RENDER_STRATEGY_RENDER: 'render',
    RENDER_STRATEGY_SHOW: 'show',
    RENDER_STRATEGY_MANUAL: 'manual'
};

/**
 * Marionette.Behavior constructor shall never be called manually.
 * The options described here should be passed as behavior options (look into Marionette documentation for details).
 * @name BackboneFormBehavior
 * @memberof module:core.form.behaviors
 * @class This behavior turns any Marionette.View into Backbone.Form. To do this Backbone.Form scans this.$el at the moment
 * defined by <code>options.renderStrategy</code> and puts field and editors defined in <code>options.schema</code> into
 * DOM-elements with corresponding Backbone.Form data-attributes.
 * It's important to note that Backbone.Form will scan the whole this.$el including nested regions that might lead to unexpected behavior.
 * Possible events:<ul>
 *     <li><code>'form:render' (form)</code> - the form has rendered and available via <code>form</code> property of the view.</li>
 * </ul>
 * @constructor
 * @extends Marionette.Behavior
 * @param {Object} options Options object.
 * @param {Object|Function} options.schema Backbone.Form schema as it's listed in [docs](https://github.com/powmedia/backbone-forms).
 * @param {Object|Function} [options.model] Backbone.Model that the form binds it's editors to. <code>this.model</code> is used by default.
 * @param {String} [options.renderStrategy='show'] Defines a moment when the form is applied to the view. May be one of:<ul>
 *     <li><code>'render'</code> - On view's 'render' event.</li>
 *     <li><code>'show'</code> - On view's 'show' event.</li>
 *     <li><code>'manual'</code> - Form render method (<code>renderForm()</code>) must be called manually.</li>
 *     </ul>
 * @param {Backbone.Form.Field} [options.field] Backbone.Form.Field that will be used to render fields of the form.
 * The field <code>core.form.fields.Field</code> is used by default.
 * @param {Marionette.View} view A view the behavior is applied to.
 * */

export default Marionette.Behavior.extend(/** @lends module:core.form.behaviors.BackboneFormBehavior.prototype */{
    initialize: function (options, view) {
        view.renderForm = this.__renderForm.bind(this);
    },

    defaults: {
        renderStrategy: constants.RENDER_STRATEGY_SHOW,
        model: function () {
            return this.model;
        },
        schema: function () {
            return this.schema;
        }
    },

    onRender: function () {
        if (this.options.renderStrategy === constants.RENDER_STRATEGY_RENDER) {
            this.__renderForm();
        }
    },

    onShow: function () {
        if (this.options.renderStrategy === constants.RENDER_STRATEGY_SHOW) {
            this.__renderForm();
        }
    },

    onDestroy () {
        if (this.form) {
            this.form.destroy();
        }
    },

    __renderForm: function () {
        let model = this.options.model;
        if (_.isFunction(model)) {
            model = model.call(this.view);
        }

        let schema = this.options.schema;
        if (_.isFunction(schema)) {
            schema = schema.call(this.view);
        }

        let form = new Form({
            model: model,
            schema: schema,
            $target: this.$el,
            field: this.options.field
        });
        this.view.form = this.form = form;
        if (this.view.initForm) {
            this.view.initForm();
        }
        this.view.triggerMethod('form:render', form);
    }
});
