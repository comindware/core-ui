/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'module/lib',
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
         * Some description for initializer
         * @name RadioGroupEditorView
         * @memberof module:core.form.editors
         * @class RadioGroupEditorView
         * @description RadioGroup editor
         * @extends module:core.form.editors.base.BaseItemEditorView {@link module:core.form.editors.base.BaseItemEditorView}
         * @param {Object} options Constructor
         * @param {Object} [options.schema] Scheme
         * @param {Boolean} [options.enabled=true] Доступ к редактору разрешен
         * @param {Boolean} [options.forceCommit=false] Обновлять значение независимо от ошибок валидации
         * @param {Array} options.radioOptions Массив значений
         * @param {Boolean} [options.readonly=false] Редактор доступен только для просмотра
         * @param {Array(Function1,Function2,...)} [options.validators] Массив функций валидации
         * */
        Backbone.Form.editors.RadioGroup = EditorBaseCollectionView.extend({
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
