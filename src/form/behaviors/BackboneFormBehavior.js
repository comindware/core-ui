import FieldView from '../fields/FieldView';
import SimplifiedFieldView from '../fields/SimplifiedFieldView';
import ErrorPlaceholderView from '../fields/ErrorPlaceholderView';
import transliterator from '../../utils/transliterator';

const componentTypes = {
    editor: 'editor',
    field: 'field'
};

// every of options.transliteratedFields becomes required-like, and overwrite next property in schema { changeMode: 'blur', autocommit: true, forceCommit: true}
// allowEmptyValue: true; // in schema turn off required-like behavior for name

const Form = Marionette.Object.extend({
    /**
     * Constructor
     *
     * @param {Object} [options.schema]
     * @param {Backbone.Model} [options.model]
     */
    initialize(options = {}) {
        this.options = options;

        this.schema = _.result(options, 'schema');
        this.model = options.model;

        if (typeof this.options.transliteratedFields === 'object') {
            transliterator.initializeTransliteration({
                model: this.model,
                schema: this.schema,
                transliteratedFields: options.transliteratedFields
            });
        }

        this.fields = {};
        this.regions = [];

        Object.entries(this.schema).forEach(entry => {
            const fieldScema = entry[1];
            const FieldType = fieldScema.field || options.field || (fieldScema.simplified ? SimplifiedFieldView : FieldView); //TODO fix api
            let field;
            try {
                field = new FieldType({
                    key: entry[0],
                    schema: fieldScema,
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

        this.__renderComponents(componentTypes.editor);
        this.__renderComponents(componentTypes.field);
    },

    handleAttach() {
        this.regions.forEach(region => {
            const currentView = region.currentView;
            if (currentView) {
                currentView._isAttached = true;
                currentView.triggerMethod('attach');
            }
        });
    },

    onDestroy() {
        this.regions.forEach(region => region.destroy());
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
    },

    __renderComponents(componentType) {
        const $target = this.options.$target;
        const view = this.options.view;

        $target.find(`[data-${componentType}s]`).each((i, el) => {
            if ((!this.model.has('uniqueFormId') && !el.hasAttribute(`${componentType}-for`)) || this.model.get('uniqueFormId').has(el.getAttribute(`${componentType}-for`))) {
                const key = el.getAttribute(`data-${componentType}s`);
                const regionName = `${key}Region`;
                const fieldRegion = view.addRegion(regionName, { el });
                this.regions.push(fieldRegion); //todo chech this out
                if (this.fields[key]) {
                    const componentView = componentType === componentTypes.field ? this.fields[key] : this.fields[key].editor;
                    view.showChildView(regionName, componentView);
                }
            }
        });
    }
});

/**
 * Marionette.Behavior constructor shall never be called manually.
 * The options described here should be passed as behavior options (look into Marionette documentation for details).
 * @name BackboneFormBehavior
 * @memberof module:core.form.behaviors
 * @class This behavior turns any Marionette.View into Backbone.Form. To do this Backbone.Form scans this.$el at the moment
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
        model() {
            return this.model;
        },
        schema() {
            return this.schema;
        }
    },

    onRender() {
        this.__renderForm();
    },

    onDestroy() {
        if (this.form) {
            this.form.destroy();
        }
    },

    onAttach() {
        this.form.handleAttach();
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

        let options = this.options.options;
        if (_.isFunction(options)) {
            options = options.call(this.view);
        }

        const form = new Form(_.defaults({
            model,
            schema,
            $target: this.$el,
            view: this.view
        }, this.options, options));
        this.view.form = this.form = form;
        if (this.view.initForm) {
            this.view.initForm();
        }
        this.view.triggerMethod('form:render', form);
    }
});
