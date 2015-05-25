/**
 * Developer: Stepan Burguchev
 * Date: 1/28/2015
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
        'core/dropdown/dropdownApi',
        'core/utils/utilsApi',
        'text!./templates/memberSelectEditor.html',
        './base/BaseLayoutEditorView',
        'core/serviceLocator',
        './impl/memberSelect/views/DefaultButtonView',
        './impl/memberSelect/views/PanelView',
        './impl/memberSelect/collections/MembersCollection',
        './impl/memberSelect/models/MemberModel',
        './impl/memberSelect/collections/MembersVirtualCollection'
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
        MembersCollection,
        MemberModel,
        MembersVirtualCollection
    ) {
        'use strict';

        var classes = {
        };

        var defaultOptions = {
            dropdownOptions: {
                buttonView: DefaultButtonView,
                popoutAlign: 'right',
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

        Backbone.Form.editors.MemberSelect = BaseLayoutEditorView.extend({
            initialize: function (options) {
                var defOpts = _.cloneDeep(defaultOptions);
                if (options.schema) {
                    _.extend(this.options, defOpts, _.pick(options.schema, _.keys(defOpts)));
                } else {
                    _.extend(this.options, defOpts, _.pick(options || {}, _.keys(defOpts)));
                }
                this.options.dropdownOptions = _.extend(defOpts.dropdownOptions, this.options.dropdownOptions);

                this.controller = options.controller;

                this.reqres = new Backbone.Wreqr.RequestResponse();
                this.reqres.setHandler('value:clear', this.onValueClear, this);
                this.reqres.setHandler('value:set', this.onValueSet, this);
                this.reqres.setHandler('value:navigate', this.onValueNavigate, this);
                this.reqres.setHandler('filter:text', this.onFilterText, this);

                this.viewModel = new Backbone.Model({
                    button: new ButtonModel({
                        enabled: this.getEnabled()
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
                this.__value(value, false);
            },

            onRender: function () {
                if (!this.getEnabled()) {
                    this.dropdownRegion.show(new this.options.dropdownOptions.buttonView(_.extend({
                        model: this.viewModel.get('button'),
                        reqres: this.reqres
                    }, this.options.dropdownOptions.buttonViewOptions)));
                    return;
                }
                // dropdown
                var dropdownOptions = _.extendDeep({
                    buttonViewOptions: {
                        model: this.viewModel.get('button'),
                        reqres: this.reqres
                    },
                    panelView: PanelView,
                    panelViewOptions: {
                        model: this.viewModel.get('panel'),
                        reqres: this.reqres
                    }
                }, this.options.dropdownOptions);
                this.dropdownView = dropdown.factory.createPopout(dropdownOptions);
                this.dropdownRegion.show(this.dropdownView);
                // hotkeys
                if (this.keyListener) {
                    this.keyListener.reset();
                }
                this.keyListener = new lib.keypress.Listener(this.el);
                _.each('down,enter,num_enter'.split(','), function (key) {
                    this.keyListener.simple_combo(key, function () {
                        this.dropdownView.open();
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

            __initCollection: function () {
                serviceLocator.cacheService.ListUsers().then(function (users) {
                    this.collection = new MembersVirtualCollection(new MembersCollection(users), {
                        comparator: utils.helpers.comparatorFor(utils.comparators.stringComparator2Asc, 'fullName')
                    });
                    this.viewModel.get('button').set('member', this.__findModel(this.getValue()));
                    this.viewModel.get('panel').set('collection', this.collection);
                }.bind(this));
            },

            __findModel: function (value) {
                return this.collection.findWhere({ id: value });
            }
        });

        return Backbone.Form.editors.MemberSelect;
    });
