/**
 * Developer: Stepan Burguchev
 * Date: 1/28/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'core/libApi',
        'core/dropdown/dropdownApi',
        'core/utils/utilsApi',
        'text!./templates/memberSelectEditor.html',
        './base/BaseLayoutEditorView',
        'core/serviceLocator',
        './impl/memberSelect/views/DefaultButtonView',
        './impl/memberSelect/views/PanelView',
        './impl/common/members/models/MemberModel',
        './impl/common/members/collections/MembersCollection'
    ],
    function (
        lib,
        dropdown,
        utils,
        template,
        BaseLayoutEditorView,
        serviceLocator,
        DefaultButtonView,
        PanelView,
        MemberModel,
        MembersCollection
    ) {
        'use strict';

        var defaultOptions = {
            dropdownOptions: {
                buttonView: DefaultButtonView,
                popoutFlow: 'right',
                customAnchor: true
            }
        };

        var ButtonModel = Backbone.AssociatedModel.extend({
            relations: [
                {
                    type: Backbone.One,
                    key: 'member',
                    relatedModel: MemberModel
                }
            ]
        });

        /**
         * @name MemberSelectEditorView
         * @memberof module:core.form.editors
         * @class Редактор для выбора пользователя из списка доступных. Поддерживаемый тип данных: <code>String</code>
         * (идентификатор пользователя). Например, <code>'account.1'</code>. Список доступных пользователей
         * берется из <code>core.services.CacheService</code>.
         * @extends module:core.form.editors.base.BaseEditorView
         * @param {Object} options Объект опций. Также поддерживаются все опции базового класса
         * {@link module:core.form.editors.base.BaseEditorView BaseEditorView}.
         * @param {Number} [options.dropdownOptions=Object] Опции используемого PopoutView.
         * Полезно для задания направления открытия и кастомизации кнопки. Значения по умолчанию:
         * <code>{ buttonView: DefaultButtonView, popoutFlow: 'right', customAnchor: true }</code>
         * */
        Backbone.Form.editors.MemberSelect = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.MemberSelectEditorView.prototype */{
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }
                _.defaults(this.options.dropdownOptions, defaultOptions.dropdownOptions);

                this.controller = options.controller;

                this.reqres = new Backbone.Wreqr.RequestResponse();
                this.reqres.setHandler('value:clear', this.onValueClear, this);
                this.reqres.setHandler('value:set', this.onValueSet, this);
                this.reqres.setHandler('value:navigate', this.onValueNavigate, this);
                this.reqres.setHandler('filter:text', this.onFilterText, this);
                this.reqres.setHandler('panel:open', this.onPanelOpen, this);

                this.viewModel = new Backbone.Model({
                    button: new ButtonModel({
                        enabled: this.getEnabled() && !this.getReadonly()
                    }),
                    panel: new Backbone.Model({
                    })
                });

                this.__initCollection();
            },

            focusElement: null,

            attributes: {
                tabindex: 0
            },

            regions: {
                dropdownRegion: '.js-dropdown-region'
            },

            className: 'users-list',

            template: Handlebars.compile(template),

            setValue: function (value) {
                this.__value(_.isArray(value) ? (value.length ? value[0] : null) : value, false);
            },

            onRender: function () {
                // dropdown
                var dropdownOptions = _.extend({
                    buttonViewOptions: {},
                    panelView: PanelView,
                    panelViewOptions: {
                        model: this.viewModel.get('panel'),
                        reqres: this.reqres
                    },
                    autoOpen: false
                }, this.options.dropdownOptions);
                _.extend(dropdownOptions.buttonViewOptions, {
                    model: this.viewModel.get('button'),
                    reqres: this.reqres
                });
                this.dropdownView = dropdown.factory.createPopout(dropdownOptions);
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
            },

            __value: function (value, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;
                this.viewModel.get('button').set('member', this.__findModel(value));
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            onValueClear: function () {
                this.__value(null, true);
            },

            onValueSet: function (value) {
                this.__value(value, true);
                this.dropdownView.close();
                this.$el.focus();
            },

            onValueNavigate: function () {
            },

            onFilterText: function (options) {
                var deferred = $.Deferred();
                var text = options.text.toLocaleLowerCase();
                this.collection.unhighlight();
                if (text === '') {
                    this.collection.filter(null);
                } else {
                    this.collection.filter(function (model) {
                        var fullName = (model.get('fullName') || '').toLocaleLowerCase();
                        return fullName.indexOf(text) !== -1;
                    });
                    this.collection.highlight(text);
                }
                deferred.resolve();
                return deferred.promise();
            },

            onPanelOpen: function () {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            },

            __initCollection: function() {
                var users = serviceLocator.cacheService.ListUsers();
                this.collection = new MembersCollection(new Backbone.Collection(users, {
                    model: MemberModel
                }), {
                    comparator: utils.helpers.comparatorFor(utils.comparators.stringComparator2Asc, 'fullName')
                });
                this.viewModel.get('button').set('member', this.__findModel(this.getValue()));
                this.viewModel.get('panel').set('collection', this.collection);
            },

            __findModel: function (value) {
                return this.collection.findWhere({ id: value });
            },

            __setEnabled: function (enabled) {
                BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
                this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
            },

            __setReadonly: function (readonly) {
                BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
                this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
            }
        });

        return Backbone.Form.editors.MemberSelect;
    });
