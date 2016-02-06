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
 * Конструктор Marionette.Behavior никогда не вызывается явно. Описанные в объекте options свойства должны
 * быть переданы как свойства behavior (см. документацию Marionette).
 * @name BackboneFormBehavior
 * @memberof module:core.form.behaviors
 * @class Данный Behavior является удобным средством для превращения любого Marionette.View в форму Backbone.Form.
 * Возможные события:<ul>
 *     <li><code>'form:render' (form)</code> - закончена отрисовка формы во View.</li>
 * </ul>
 * @constructor
 * @extends Marionette.Behavior
 * @param {Object} options Объект опций
 * @param {Object|Function} options.schema Схема Backbone.Form в [стандартном формате](https://github.com/powmedia/backbone-forms).
 * @param {Object|Function} [options.model] Модель, которую необходимо привязать к данной форме. По умолчанию используется <code>this.model</code>.
 * @param {String} [options.renderStrategy='show'] Определяет момент, когда осуществляется отрисовка эдиторов во View. Варианты:<ul>
 *     <li><code>'render'</code> - В методе onRender.</li>
 *     <li><code>'show'</code> - В методе onShow.</li>
 *     <li><code>'manual'</code> - Метод отрисовки (<code>renderForm()</code>) должен быть вызван вручную.</li>
 *     </ul>
 * @param {Backbone.Form.Field} [options.field] Backbone.Form.Field, который необходимо использовать при отображении редакторов в этой форме.
 * По умолчанию используется <code>core.form.fields.CommonField</code>.
 * @param {Marionette.View} view View на которую применен данных Behavior
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
