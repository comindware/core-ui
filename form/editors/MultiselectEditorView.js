/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(
    [
        'module/lib',
        'core/list/listApi',
        'core/dropdown/dropdownApi',
        'text!./templates/multiSelectEditor.html',
        './base/BaseLayoutEditorView',
        './impl/multiSelect/views/MultiSelectPanelView',
        './impl/multiSelect/views/MultiSelectButtonView'
    ],
    function(lib, list, dropdown, template, BaseLayoutEditorView, MultiSelectPanelView, MultiSelectButtonView) {
        'use strict';

        var defaultOptions = {
            collection: null,
            displayAttribute: 'text'
        };

        Backbone.Form.editors.MultiSelect = BaseLayoutEditorView.extend({
            initialize: function(options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.reqres = new Backbone.Wreqr.RequestResponse();
                this.reqres.setHandler('panel:open', this.onPanelOpen, this);
                this.reqres.setHandler('apply', this.__applyValue, this);

                if (_.isArray(this.options.collection)) {
                    this.options.collection = new Backbone.Collection(this.options.collection);
                }

                this.collection = this.options.collection;
                
                this.listenTo(this.collection, 'add', this.__onCollectionChange);
                this.listenTo(this.collection, 'remove', this.__onCollectionChange);
                this.listenTo(this.collection, 'reset', this.__onCollectionChange);
                this.listenTo(this.collection, 'change:selected', this.__onItemToggle);

                this.viewModel = new Backbone.Model({
                    button: new Backbone.Model({
                        collection: this.collection,
                        value: this.__findModels(this.getValue())
                    }),
                    panel: new Backbone.Model({
                        collection: this.collection,
                        value: this.__findModels(this.getValue()),
                        displayAttribute: this.options.displayAttribute
                    })
                });
            },

            focusElement: null,

            attributes: {
                tabindex: 0
            },

            regions: {
                dropdownRegion: '.js-dropdown-region'
            },

            className: 'dev-multi-select',

            template: Handlebars.compile(template),

            onRender: function() {
                this.dropdownView = dropdown.factory.createDropdown({
                    buttonView: MultiSelectButtonView,
                    buttonViewOptions: {
                        model: this.viewModel.get('button'),
                        reqres: this.reqres
                    },
                    panelView: MultiSelectPanelView,
                    panelViewOptions: {
                        model: this.viewModel.get('panel'),
                        reqres: this.reqres
                    },
                    autoOpen: false
                });

                this.dropdownRegion.show(this.dropdownView);
            },

            __onCollectionChange: function() {
                var values = this.getValue();
                var valueModels = this.__findModels(values);

                if (valueModels != null) {
                    if (valueModels != this.viewModel.get('panel').get("value")) {
                        this.viewModel.get('panel').set('value', valueModels);
                    }
                    return;
                }

                if (this.collection.length === null) {
                    this.setValue(null);
                }
            },

            __onItemToggle: function(itemModel) {
                if (itemModel.get('selected')) {
                    this.__setValue(itemModel.id);
                } else {
                    this.__unsetValue(itemModel.id);
                }
            },

            __findModels: function(values) {
                return this.collection ? this.collection.filter(function(model) {
                    return ~_.indexOf(values, model.id);
                }) : null;
            },

            __setValue: function(value) {
                if (~_.indexOf(this.tempValue, value)) {
                    return;
                }

                this.tempValue = this.tempValue.concat(value);
                this.__updateViewModel(this.tempValue);
            },

            __unsetValue: function(value) {
                if (!~_.indexOf(this.tempValue, value)) {
                    return;
                }

                this.tempValue = _.without(this.tempValue, value);
                this.__updateViewModel(this.tempValue);
            },

            __updateViewModel: function(values) {
                var valueModels = this.__findModels(values) || null;
                this.viewModel.get('panel').set('value', valueModels);
            },

            __applyValue: function() {
                this.viewModel.get('button').set('value', this.__findModels(this.tempValue));
                this.setValue(this.tempValue);
                this.__triggerChange();
                this.dropdownView.close();
            },

            onPanelOpen: function() {
                var value = this.getValue();
                this.tempValue = value === null ? [] : value;
                this.__updateViewModel(this.tempValue);

                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            }
        });

        return Backbone.Form.editors.MultiSelect;
    }
);
