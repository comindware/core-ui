/**
 * Developer: Grigory Kuznetsov
 * Date: 17.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib', 'text!./templates/timeEditor.html', './base/BaseLayoutEditorView', './impl/dateTime/views/TimeView'],
    function (lib, template, BaseLayoutEditorView, TimeView) {
        'use strict';

        var defaultOptions = {
        };

        /**
         * Some description for initializer
         * @name TimeEditorView
         * @memberof module:core.form.editors
         * @class TimeEditorView
         * @description Time editor
         * @extends module:core.form.editors.base.BaseItemEditorView {@link module:core.form.editors.base.BaseItemEditorView}
         * @param {Object} options Constructor
         * @param {Object} [options.schema] scheme
         * @param {Boolean} [options.enabled=true] Доступ к редактору разрешен
         * @param {Boolean} [options.forceCommit=false] Обновлять значение независимо от ошибок валидации
         * @param {Boolean} [options.readonly=false] Редактор доступен только для просмотра
         * @param {Function[]} [options.validators] Массив функций валидации
         * */
        Backbone.Form.editors.Time = BaseLayoutEditorView.extend({
            initialize: function (options) {
                options = options || {};
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.timeModel = new Backbone.Model({
                    value: this.value,
                    enabled: this.getEnabled(),
                    readonly: this.getReadonly()
                });
                this.listenTo(this.timeModel, 'change:value', this.__change, this);

                this.timeView = new TimeView({
                    model: this.timeModel
                });
            },

            regions: {
                timeRegion: '.js-time-region'
            },

            className: 'l-field l-field_time',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return this.options;
            },

            __change: function () {
                this.__value(this.timeModel.get('value'), true, true);
            },

            setValue: function (value) {
                this.__value(value, true, false);
                this.timeModel.set('value', value);
            },

            onRender: function () {
                this.timeRegion.show(this.timeView);
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

            getValue: function () {
                return this.value === null ? this.value : lib.moment(this.value).toISOString();
            },

            __setEnabled: function (enabled) {
                BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
                this.timeModel.set({enabled: this.getEnabled()});
            },

            __setReadonly: function (readonly) {
                BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
                this.timeModel.set({readonly: this.getReadonly()});
            }
        });

        return Backbone.Form.editors.Time;
    });
