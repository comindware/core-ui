/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'module/lib',
        'core/dropdown/dropdownApi',
        'text!./templates/referenceEditor.html',
        './base/BaseLayoutEditorView',
        './impl/reference/views/ReferenceButtonView',
        './impl/reference/views/ReferencePanelView',
        './impl/reference/collections/BaseReferenceCollection',
        './impl/reference/models/SearchMoreModel',
        './impl/reference/models/DefaultReferenceModel'
    ],
    function (
        lib,
        dropdown,
        template,
        BaseLayoutEditorView,
        ReferenceButtonView,
        ReferencePanelView,
        ReferenceCollection,
        SearchMoreModel,
        DefaultReferenceModel
    ) {
        'use strict';

        var classes = {
        };

        var defaultOptions = {
            'controller': null
        };

        /**
         * Some description for initializer
         * @name ReferenceEditorView
         * @memberof module:core.form.editors
         * @class ReferenceEditorView
         * @description Reference editor
         * @extends module:core.form.editors.base.BaseItemEditorView {@link module:core.form.editors.base.BaseItemEditorView}
         * @param {Object} options Constructor
         * @param {Object} [options.schema] Scheme
         * @param {Backbone.Controller} options.controller Backbone.Controller
         * @param {Boolean} [options.enabled=true] Доступ к редактору разрешен
         * @param {Boolean} [options.forceCommit=false] Обновлять значение независимо от ошибок валидации
         * @param {Array} options.radioOptions Массив значений
         * @param {Boolean} [options.readonly=false] Редактор доступен только для просмотра
         * @param {Array(Function1,Function2,...)} [options.validators] Массив функций валидации
         * */
        Backbone.Form.editors.Reference = BaseLayoutEditorView.extend({
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.reqres = new Backbone.Wreqr.RequestResponse();

                this.controller = this.options.controller;

                this.value = this.__adjustValue(this.value);


                this.reqres.setHandler('panel:open', this.onPanelOpen, this);
                this.reqres.setHandler('value:clear', this.onValueClear, this);
                this.reqres.setHandler('value:set', this.onValueSet, this);
                this.reqres.setHandler('value:navigate', this.onValueNavigate, this);
                this.reqres.setHandler('search:more', this.onSearchMore, this);
                this.reqres.setHandler('filter:text', this.onFilterText, this);

                this.viewModel = new Backbone.Model({
                    button: new Backbone.Model({
                        value: this.getValue(),
                        state: 'view',
                        enabled: this.getEnabled() && !this.getReadonly()
                    }),
                    panel: new Backbone.Model({
                        value: this.getValue(),
                        collection: this.controller.collection,
                        totalCount: this.controller.totalCount || 0
                    })
                });
            },

            focusElement: null,

            attributes: {
                tabindex: 0
            },

            ui: {
                searchMore: '.js-search-more-button'
            },

            events: {
                'click @ui.searchMore': '__searchMore'
            },

            regions: {
                dropdownRegion: '.js-dropdown-region'
            },

            className: 'pr-reference-editor',

            template: Handlebars.compile(template),

            setValue: function (value) {
                value = this.__adjustValue(value);
                this.__value(value, false);
            },

            onRender: function () {
                // dropdown
                this.dropdownView = dropdown.factory.createDropdown({
                    buttonView: ReferenceButtonView,
                    buttonViewOptions: {
                        model: this.viewModel.get('button'),
                        reqres: this.reqres
                    },
                    panelView: ReferencePanelView,
                    panelViewOptions: {
                        model: this.viewModel.get('panel'),
                        reqres: this.reqres
                    },
                    panelPosition: 'down-over',
                    autoOpen: false
                });
                this.dropdownRegion.show(this.dropdownView);

                // hotkeys
                if (this.keyListener) {
                    this.keyListener.reset();
                }
                this.keyListener = new lib.keypress.Listener(this.el);
                _.each('down,enter,num_enter'.split(','), function (key) {
                    this.keyListener.simple_combo(key, function () {
                        if (this.getEnabled() && !this.getReadonly()) {
                            this.dropdownView.open();
                        }
                    }.bind(this));
                }, this);
                this.$el.toggleClass('pr-empty', _.isEmpty(this.value));
            },

            __adjustValue: function (value) {
                if (!value || !value.id) {
                    return null;
                }
                if (value instanceof DefaultReferenceModel) {
                    return value;
                }
                if (value instanceof Backbone.Model) {
                    value = value.attributes;
                }

                return new DefaultReferenceModel(value);
            },

            __value: function (value, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;
                this.viewModel.get('button').set('value', value);
                this.viewModel.get('panel').set('value', value);
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            onValueClear: function () {
                this.__value(null, true);
            },

            onValueSet: function (model) {
                this.__value(model, true);
                this.dropdownView.close();
                this.$el.toggleClass('pr-empty', _.isEmpty(this.value));
                this.$el.focus();
            },

            onValueNavigate: function () {
               return this.controller.navigate(this.getValue());
            },

            onSearchMore: function () {
                // TODO: Not implemented in Release 1
                this.dropdownView.close();
            },

            onFilterText: function (options) {
                var deferred = $.Deferred();
                this.controller.fetch(options).then(function () {
                    this.viewModel.get('panel').set('totalCount', this.controller.totalCount);
                    deferred.resolve();
                }.bind(this));
                return deferred.promise();
            },

            onPanelOpen: function () {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            },

            setReadonly: function (readonly) {
                BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
                this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
            },

            setEnabled: function (enabled) {
                BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
                this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
            }
        });

        return Backbone.Form.editors.Reference;
    });
