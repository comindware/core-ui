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

                if (_.isArray(this.options.collection)) {
                    this.options.collection = new Backbone.Collection(this.options.collection);
                }

                this.collection = this.options.collection;
                
                this.listenTo(this.collection, 'add', this.__onCollectionChange);
                this.listenTo(this.collection, 'remove', this.__onCollectionChange);
                this.listenTo(this.collection, 'reset', this.__onCollectionChange);
                this.listenTo(this.collection, 'select', this.__onSelect);
                this.listenTo(this.collection, 'deselect', this.__onDeselect);

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
                        model: this.viewModel.get('button')
                    },
                    panelView: MultiSelectPanelView,
                    panelViewOptions: {
                        model: this.viewModel.get('panel')
                    },
                    autoOpen: false
                });

                this.listenTo(this.dropdownView, 'panel:open', this.onPanelOpen);
                this.listenTo(this.dropdownView, 'select:all', this.__selectAll);
                this.listenTo(this.dropdownView, 'apply', this.__applyValue);
                this.listenTo(this.dropdownView, 'reset', this.__resetValue);

                this.dropdownRegion.show(this.dropdownView);
            },

            __onCollectionChange: function() {
                if (!this.collection.length) {
                    this.setValue(null);
                    return;
                }

                this.__trimValues();

                var values = this.getValue();
                var valueModels = this.__findModels(values);

                if (valueModels && valueModels.length) {
                    this.viewModel.get('panel').set('value', valueModels);
                } else {
                    this.setValue(null);
                }
            },

            __onSelect: function(model) {
                this.__select(model);
                this.__updateViewModel();
            },

            __onDeselect: function(model) {
                this.__deselect(model);
                this.__updateViewModel();
            },

            __select: function(model) {
                model.selected = true;
                this.__setValue(model.id);
            },

            __deselect: function(model) {
                model.selected = false;
                this.__unsetValue(model.id);
            },

            __selectAll: function(silent) {
                this.collection.each(function(model) {
                    model.trigger('select', model);
                }.bind(this));
            },

            __deselectAll: function(silent) {
                this.collection.each(function(model) {
                    model.trigger('deselect', model);
                }.bind(this));
            },

            __trimValues: function() {
                var values = this.getValue();
                if (values === null) {
                    return;
                }

                _.chain(values).
                    reject(function(value) {
                        return this.collection.get(value);
                    }.bind(this)).
                    every(function(rejectedValue) {
                        values = _.without(values, rejectedValue);
                    });

                if (values.length) {
                    this.setValue(values);
                } else {
                    this.setValue(null);
                }
            },

            __findModels: function(values) {
                return this.collection ? this.collection.filter(function(model) {
                    return _.contains(values, model.id);
                }) : null;
            },
            
            __setValue: function(value) {
                if (~_.indexOf(this.tempValue, value)) {
                    return;
                }

                this.tempValue = this.tempValue.concat(value);
            },

            __unsetValue: function(value) {
                if (!~_.indexOf(this.tempValue, value)) {
                    return;
                }

                this.tempValue = _.without(this.tempValue, value);
            },
            
            __updateViewModel: function() {
                var valueModels = this.__findModels(this.tempValue) || null;
                this.viewModel.get('panel').set('value', valueModels);
            },

            __applyValue: function() {
                this.viewModel.get('button').set('value', this.__findModels(this.tempValue));
                this.setValue(this.tempValue);
                this.__trimValues();
                this.__triggerChange();
                this.dropdownView.close();
            },

            __resetValue: function() {
                var value = this.getValue();
                this.tempValue = value === null ? [] : value;

                this.__updateViewModel();
                //// Убрать галочки
                var valueModels = this.viewModel.get('panel').get('value');
                _.each(valueModels, function(valueModel) {
                    valueModel.trigger('select', valueModel);
                });
            },

            onPanelOpen: function() {
                this.__resetValue();

                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            }
        });

        return Backbone.Form.editors.MultiSelect;
    }
);
