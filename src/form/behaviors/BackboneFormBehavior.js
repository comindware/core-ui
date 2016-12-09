/**
 * Developer: Stepan Burguchev
 * Date: 11/19/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import CommonField from '../fields/CommonField';

let ExtendedForm = Backbone.Form.extend({
    initialize: function (options) {
        this.options = options || {};
        Backbone.Form.prototype.initialize.apply(this, _.toArray(arguments));
    },

    name: 'form',

    render: function () {
        var self = this,
            fields = this.fields;

        //Render form
        var $form = this.options.$target;

        //Render standalone editors
        $form.find('[data-editors]').each(function (i, el) {
            var $editorRegion = $(el);
            var path = $editorRegion.attr('data-editors');
            $editorRegion.append(fields[path].editor.render().el);
        });

        //Render standalone fields
        $form.find('[data-fields]').each(function (i, el) {
            var $fieldRegion = $(el);
            var path = $fieldRegion.attr('data-fields');
            $fieldRegion.append(fields[path].render().el);
        });

        //Set the main element
        this.setElement($form);
        return this;
    },

    handleEditorEvent: function (event, editor, field) {
        var formEvent = this.name + ':' + event;
        if (event !== 'validated') {
            //Re-trigger editor events on the form
            this.trigger.call(this, formEvent, this, editor, Array.prototype.slice.call(arguments, 2));
        }

        //Trigger additional events
        switch (event) {
        case 'statechanged':
            this.state = editor.state;
            break;
        case 'change':
            this.trigger('change', this, editor);
            this.trigger(editor.key + ':change', this, editor);
            break;
        case 'focus':
            if (!this.hasFocus) {
                this.trigger('focus', this);
            }
            break;
        case 'blur':
            if (this.hasFocus) {
                var self = this;
                _.defer(function () {
                    var focusedField = _.find(self.fields, function (field) {
                        return field.editor.hasFocus;
                    });

                    if (!focusedField) {
                        self.trigger('blur', self);
                    }
                });
            }
            break;
        case 'validated':
            this.validate({
                silent: true
            });
            break;
        case 'resize':
            $(window).trigger('resize');
            break;
        }
    },

    setErrors: function(errors) {
        _.each(_.pairs(errors), function(pair) {
            var field = this.fields[pair[0]];
            if (field) {
                field.setError(pair[1]);
            }
        }.bind(this));
    },

    onShow: function () {
        this.validate({
            silent: true
        });
        _.each(this.fields || {}, function (v) {
            if (v.editor.onShow) {
                v.editor.onShow();
            }
        });
    },

    /**
     * Validate the data
     * @return {Object} Validation errors
     */
    validate: function (options) {
        var self = this,
            fields = this.fields,
            model = this.model,
            errors = {};

        options = options || {};

        //Collect errors from schema validation
        _.each(fields, function (field) {
            var error = field.validate(options);
            if (error) {
                errors[field.key] = error;
            }
        });

        //Get errors from default Backbone model validator
        if (!options.skipModelValidate && model && model.validate) {
            var modelErrors = model.validate(this.getValue());

            if (modelErrors) {
                var isDictionary = _.isObject(modelErrors) && !_.isArray(modelErrors);

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
                        }

                        else {
                            //Otherwise add to '_others' key
                            errors._others = errors._others || [];
                            var tmpErr = {};
                            tmpErr[key] = val;
                            errors._others.push(tmpErr);
                        }
                    });
                }
            }
        }

        var result = _.isEmpty(errors) ? null : errors;
        this.trigger('form:validated', !result, result);
        return result;
    },

    validationDelay: 1000,

    Field: CommonField
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
 * The field <code>core.form.fields.CommonField</code> is used by default.
 * @param {Marionette.View} view A view the behavior is applied to.
 * */

export default Marionette.Behavior.extend(/** @lends module:core.form.behaviors.BackboneFormBehavior.prototype */{
    initialize: function (options, view) {
        view.renderForm = this.__renderForm.bind(this);
        if (options.field) {
            this.CustomizedForm = ExtendedForm.extend({
                Field: options.field
            });
        } else {
            this.CustomizedForm = ExtendedForm;
        }
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

    __renderForm: function () {
        var model = this.options.model;
        if (_.isFunction(model)) {
            model = model.call(this.view);
        }
        var schema = this.options.schema;
        if (_.isFunction(schema)) {
            schema = schema.call(this.view);
        }
        var form = new this.CustomizedForm({
            model: model,
            schema: schema,
            $target: this.$el
        });
        this.view.form = this.form = form;
        if (this.view.initForm) {
            this.view.initForm();
        }
        form.render();
        form.onShow();
        this.view.triggerMethod('form:render', form);
    }
});
