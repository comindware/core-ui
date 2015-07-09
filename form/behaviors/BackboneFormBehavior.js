/**
 * Developer: Stepan Burguchev
 * Date: 11/19/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['../ExtendedForm'],
    function (ExtendedForm) {
        'use strict';

        var constants = {
            RENDER_STRATEGY_RENDER: 'render',
            RENDER_STRATEGY_SHOW: 'show',
            RENDER_STRATEGY_MANUAL: 'manual'
        };

        //noinspection JSUnresolvedFunction,SpellCheckingInspection
        var MariotizedExtendedForm = ExtendedForm.extend({
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

        return Marionette.Behavior.extend({
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
    });
