/**
 * Developer: Stepan Burguchev
 * Date: 11/19/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import ExtendedForm from '../ExtendedForm';

const constants = {
    RENDER_STRATEGY_RENDER: 'render',
    RENDER_STRATEGY_SHOW: 'show',
    RENDER_STRATEGY_MANUAL: 'manual'
};

//noinspection JSUnresolvedFunction,SpellCheckingInspection
let MariotizedExtendedForm = ExtendedForm.extend({
    initialize: function (options) {
        this.options = options || {};
        ExtendedForm.prototype.initialize.apply(this, _.toArray(arguments));
    },

    render: function () {
        var self = this,
            fields = this.fields;

        //Render form
        var $form = this.options.$target;

        //Render standalone editors
        $form.find('[data-editors]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.attr('data-editors');

            if (_.isUndefined(selection)) {
                return;
            }

            //Work out which fields to include
            var keys = (selection === '*') ?
                self.selectedFields || _.keys(fields) :
                selection.split(',');

            //Add them
            _.each(keys, function (key) {
                var field = fields[key];

                $container.append(field.editor.render().el);
            });
        });

        //Render standalone fields
        $form.find('[data-fields]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.attr('data-fields');

            if (_.isUndefined(selection)) {
                return;
            }

            //Work out which fields to include
            var keys = (selection === '*') ? self.selectedFields || _.keys(fields) : selection.split(',');

            //Add them
            _.each(keys, function (key) {
                var field = fields[key];

                $container.append(field.render().el);
            });
        });

        //Render fieldsets
        $form.find('[data-fieldsets]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.attr('data-fieldsets');

            if (_.isUndefined(selection)) {
                return;
            }

            _.each(self.fieldsets, function (fieldset) {
                $container.append(fieldset.render().el);
            });
        });

        //Set the main element
        this.setElement($form);
        return this;
    }
});

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
            this.CustomizedForm = MariotizedExtendedForm.extend({
                Field: options.field
            });
        } else {
            this.CustomizedForm = MariotizedExtendedForm;
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
        var stateModel = this.options.stateModel;
        if (_.isFunction(stateModel)) {
            stateModel = stateModel.call(this.view);
        }
        var form = new this.CustomizedForm({
            model: model,
            schema: schema,
            $target: this.$el,
            stateModel: stateModel
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
