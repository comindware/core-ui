/**
 * Developer: Grigory Kuznetsov
 * Date: 07/15/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib', 'text!./templates/dateEditor.html', './base/BaseLayoutEditorView', './impl/dateTime/views/DateView'],
    function (lib, template, BaseLayoutEditorView, DateView) {
        'use strict';

        var defaultOptions = {
        };

        /**
         * Some description for initializer
         * @name DateEditorView
         * @memberof module:core.form.editors
         * @class DateEditorView
         * @description Date editor
         * @extends module:core.form.editors.base.BaseItemEditorView {@link module:core.form.editors.base.BaseItemEditorView}
         * @param {Object} options Constructor
         * @param {Object} [options.schema] Scheme
         * @param {Boolean} [options.autocommit=false] Автоматическое обновление значения
         * @param {Boolean} [options.enabled=true] Доступ к редактору разрешен
         * @param {Boolean} [options.forceCommit=false] Обновлять значение независимо от ошибок валидации
         * @param {Boolean} [options.readonly=false] Редактор доступен только для просмотра
         * @param {Array(Function1,Function2,...)} [options.validators] Массив функций валидации
         * */
        Backbone.Form.editors.Date = BaseLayoutEditorView.extend({
            initialize: function (options) {
                options = options || {};
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.dateModel = new Backbone.Model({
                    value: this.value,
                    enabled: this.getEnabled(),
                    readonly: this.getReadonly()
                });
                this.listenTo(this.dateModel, 'change:value', this.__change, this);

                this.dateView = new DateView({
                    model: this.dateModel
                });
            },

            regions: {
                dateRegion: '.js-date-region'
            },

            className: 'l-field l-field_date',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return this.options;
            },

            __change: function () {
                this.__value(this.dateModel.get('value'), true, true);
            },

            setValue: function (value) {
                this.__value(value, true, false);
                this.dateModel.set('value', value);
            },

            onRender: function () {
                this.dateRegion.show(this.dateView);
            },

            getValue: function () {
                return this.value === null ? this.value : lib.moment(this.value).toISOString();
            },

            __value: function (value, updateUi, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;

                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            __setEnabled: function (enabled) {
                BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
                this.dateModel.set({enabled: this.getEnabled()});
            },

            __setReadonly: function (readonly) {
                BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
                this.dateModel.set({readonly: this.getReadonly()});
            }
        });

        return Backbone.Form.editors.Date;
    });
