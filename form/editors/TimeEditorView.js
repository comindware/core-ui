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

define(['text!./templates/timeEditor.html', './base/BaseLayoutEditorView', './impl/dateTime/views/TimeView', 'moment'],
    function (template, BaseLayoutEditorView, TimeView, moment) {
        'use strict';

        var defaultOptions = {
        };

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

            className: 'l-field',

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
