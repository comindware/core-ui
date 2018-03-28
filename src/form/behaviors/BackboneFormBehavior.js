import FieldView from '../fields/FieldView';
import ErrorPlaceholderView from '../fields/ErrorPlaceholderView';

const Form = Marionette.Object.extend({
    /**
     * Constructor
     *
     * @param {Object} [options.schema]
     * @param {Backbone.Model} [options.model]
     */
    initialize(options = {}) {
        this.options = options;
        this.__regionManager = new Marionette.RegionManager();
        this.schema = _.result(options, 'schema');
        this.model = options.model;

        this.fields = {};

        Object.entries(this.schema).forEach(entry => {
            const FieldType = entry[1].field || options.field || FieldView; //TODO fix api
            let field;
            try {
                field = new FieldType({
                    form: this,
                    key: entry[0],
                    schema: entry[1],
                    model: this.model
                });
                this.listenTo(field.editor, 'all', this.__handleEditorEvent);
            } catch (e) {
                field = new ErrorPlaceholderView();
                Core.InterfaceError.logError(e, field.getId());
            } finally {
                this.fields[entry[0]] = field;
            }
        });

        const $target = this.options.$target;

        //Render standalone editors
        $target.find('[data-editors]').each((i, el) => {
            //TODO Merge with previous
            if ((!this.model.has('uniqueFormId') && !el.hasAttribute('editor-for')) || el.getAttribute('editor-for') === this.model.get('uniqueFormId')) {
                const key = el.getAttribute('data-editors');
                const regionName = `${key}Region`;

                this.__regionManager.addRegion(regionName, { el });
                this.fields[key] && this.__regionManager.get(regionName).show(this.fields[key].editor);
            }
        });

        //Render standalone fields
        $target.find('[data-fields]').each((i, el) => {
            //TODO Merge with previous
            if ((!this.model.has('uniqueFormId') && !el.hasAttribute('field-for')) || el.getAttribute('field-for') === this.model.get('uniqueFormId')) {
                const key = el.getAttribute('data-fields');
                const regionName = `${key}Region`;

                this.__regionManager.addRegion(regionName, { el });
                this.fields[key] && this.__regionManager.get(regionName).show(this.fields[key]);
            }
        });
    },

    /**
     * Update the model with all latest values.
     *
     * @param {Object} [options]  Options to pass to Model#set (e.g. { silent: true })
     *
     * @return {Object}  Validation errors
     */
    commit(options = {}) {
        // Validate
        const errors = this.validate({
            skipModelValidate: !options.validate
        });
        if (errors) {
            return errors;
        }

        // Commit
        let modelError = null;
        const setOptions = Object.assign(
            {
                error(model, e) {
                    modelError = e;
                }
            },
            options
        );

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
    getEditor(key) {
        const field = this.fields[key];
        if (!field) {
            throw new Error(`Field not found: ${key}`);
        }
        return field.editor;
    },

    onDestroy() {
        this.__regionManager.destroy();
    },

    /**
     * Get all the field values as an object.
     * @param {String} [key]    Specific field value to get
     */
    getValue(key) {
        // Return only given key if specified
        if (key) {
            return this.fields[key].getValue();
        }

        // Otherwise return entire form
        const values = {};
        _.each(this.fields, field => {
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
    setValue(prop, val) {
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

    __handleEditorEvent(event, editor) {
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
                    const focusedField = Object.values(this.fields).find(f => f.editor.hasFocus);
                    if (!focusedField) {
                        this.hasFocus = false;
                        this.trigger('blur', this);
                    }
                }
                break;
            default:
                break;
        }
    },

    setErrors(errors) {
        Object.entries(errors).forEach(entry => {
            const field = this.fields[entry[0]];
            if (field) {
                field.setError(entry[1]);
            }
        });
    },

    /**
     * Validate the data
     * @return {Object} Validation errors
     */
    validate(options = {}) {
        const fields = this.fields;
        const model = this.model;
        const errors = {};

        //Collect errors from schema validation
        Object.values(fields).forEach(field => {
            const error = field.validate(options);
            if (error) {
                errors[field.key] = error;
            }
        });

        //Get errors from default Backbone model validator
        if (!options.skipModelValidate && model && model.validate) {
            const modelErrors = model.validate(this.getValue());

            if (modelErrors) {
                const isDictionary = _.isObject(modelErrors) && !Array.isArray(modelErrors);

                //If errors are not in object form then just store on the error object
                if (!isDictionary) {
                    errors._others = errors._others || [];
                    errors._others.push(modelErrors);
                }

                //Merge programmatic errors (requires model.validate() to return an object e.g. { fieldKey: 'error' })
                if (isDictionary) {
                    Object.entries(modelErrors).forEach(entrie => {
                        //Set error on field if there isn't one already
                        if (fields[entrie[0]] && !errors[entrie[0]]) {
                            fields[entrie[0]].setError(entrie[1]);
                            errors[entrie[0]] = entrie[1];
                        } else {
                            //Otherwise add to '_others' entrie[0]
                            errors._others = errors._others || [];
                            errors._others.push({
                                [entrie[0]]: entrie[1]
                            });
                        }
                    });
                }
            }
        }

        const result = Object.keys(errors).length === 0 ? null : errors;
        this.trigger('form:validated', !result, result);

        return result;
    },

    /**
     * Gives the first editor in the form focus
     */
    focus() {
        if (this.hasFocus) {
            return;
        }

        const field = this.fields[0];
        if (!field) {
            return;
        }
        field.editor.focus();
    },

    /**
     * Removes focus from the currently focused editor
     */
    blur() {
        if (!this.hasFocus) {
            return;
        }

        const focusedField = Object.values(this.fields).forEach(field => field.editor.hasFocus);
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

export default Marionette.Behavior.extend({
    initialize(options, view) {
        view.renderForm = this.__renderForm.bind(this);
    },

    defaults: {
        renderStrategy: constants.RENDER_STRATEGY_SHOW,
        model() {
            return this.model;
        },
        schema() {
            return this.schema;
        }
    },

    onRender() {
        if (this.options.renderStrategy === constants.RENDER_STRATEGY_RENDER) {
            this.__renderForm();
        }
    },

    onShow() {
        if (this.options.renderStrategy === constants.RENDER_STRATEGY_SHOW) {
            this.__renderForm();
        }
    },

    onDestroy() {
        if (this.form) {
            this.form.destroy();
        }
    },

    __renderForm() {
        let model = this.options.model;
        if (_.isFunction(model)) {
            model = model.call(this.view);
        }

        let schema = this.options.schema;
        if (_.isFunction(schema)) {
            schema = schema.call(this.view);
        }

        const form = new Form({
            model,
            schema,
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
