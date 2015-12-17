/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'core/libApi',
        './base/BaseCollectionEditorView',
        './impl/radioGroup/views/RadioButtonView',
        './impl/radioGroup/collections/RadioGroupCollection'
    ],
    function (lib, EditorBaseCollectionView, RadioButtonView, RadioGroupCollection) {
        'use strict';

        var defaultOptions = {
            radioOptions: [{ id: '', displayText: '' }]
        };

        /**
         * @name RadioGroupEditorView
         * @memberof module:core.form.editors
         * @class Радио-группа. Возможно выбрать одно значение из возможных
         * (аналогично {@link module:core.form.editors.DropdownEditorView DropdownEditorView}). Тип данных редактируемого значения должен
         * совпадать с типом данных поля <code>id</code> элементов массива <code>radioOptions</code>.
         * @extends module:core.form.editors.base.BaseEditorView
         * @param {Object} options Объект опций. Также поддерживаются все опции базового класса
         * {@link module:core.form.editors.base.BaseEditorView BaseEditorView}.
         * @param {Array} options.radioOptions Массив объектов <code>{ id, displayText }</code>, описывающих радио-кнопки.
         * */
        Backbone.Form.editors.RadioGroup = EditorBaseCollectionView.extend(/** @lends module:core.form.editors.RadioGroupEditorView.prototype */{
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.collection = new RadioGroupCollection(this.options.radioOptions);
            },

            className: 'fd-radio-group',

            childView: RadioButtonView,

            collectionEvents: {
                'select:one': '__onSelectChild'
            },

            childViewOptions: function () {
                return {
                    selected: this.getValue(),
                    enabled: this.getEnabled() && !this.getReadonly()
                };
            },

            __onSelectChild: function (model) {
                this.__value(model.get('id'), true);
            },

            setValue: function (value) {
                this.__value(value, false);
            },

            __setEnabled: function (enabled) {
                EditorBaseCollectionView.prototype.__setEnabled.call(this, enabled);
                var isEnabled = this.getEnabled() && !this.getReadonly();
                this.children.each(function (cv) {
                    cv.setEnabled(isEnabled);
                }.bind(this));
            },

            __setReadonly: function (readonly) {
                EditorBaseCollectionView.prototype.__setReadonly.call(this, readonly);
                var isEnabled = this.getEnabled() && !this.getReadonly();
                this.children.each(function (cv) {
                    cv.setEnabled(isEnabled);
                }.bind(this));
            },

            __value: function (value, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;
                this.collection.findWhere({ id: value }).select();
                if (triggerChange) {
                    this.__triggerChange();
                }
            }
        });

        return Backbone.Form.editors.RadioGroup;
    });
