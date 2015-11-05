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
            displayAttribute: 'text',
            allowEmptyValue: true,
            explicitApply: false
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
                var collectionChangeHandler = _.throttle(this.__onCollectionChange, 100, {leading: false});

                this.listenTo(this.collection, 'add', collectionChangeHandler);
                this.listenTo(this.collection, 'remove', collectionChangeHandler);
                this.listenTo(this.collection, 'reset', collectionChangeHandler);
                this.listenTo(this.collection, 'select', this.__onSelect);
                this.listenTo(this.collection, 'deselect', this.__onDeselect);

                this.viewModel = new Backbone.Model({
                    button: new Backbone.Model({
                        collection: this.collection,
                        value: this.__findModels(this.getValue())
                    }),
                    panel: new Backbone.Model({
                        collection: this.collection
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
                        model: this.viewModel.get('panel'),
                        displayAttribute: this.options.displayAttribute,
                        explicitApply: this.options.explicitApply
                    },
                    autoOpen: false
                });

                this.listenTo(this.dropdownView, 'close', this.onPanelClose);

                this.listenTo(this.dropdownView, 'button:open:panel', this.onPanelOpen);

                this.listenTo(this.dropdownView, 'panel:select:all', this.__selectAll);
                this.listenTo(this.dropdownView, 'panel:apply', this.__applyValue);
                this.listenTo(this.dropdownView, 'panel:close', this.dropdownView.close.bind(this.dropdownView));

                this.dropdownRegion.show(this.dropdownView);
            },

            __onCollectionChange: function() {
                this.__trimValues();
                this.__triggerChange();
                this.viewModel.get('button').set('value', this.__findModels(this.getValue()));
                this.__resetValue();
            },

            __onSelect: function(model) {
                this.__select(model);
            },

            __onDeselect: function(model) {
                this.__deselect(model);

                if (!this.options.allowEmptyValue) {
                    var valueModels = this.__findModels(this.tempValue) || null;
                    if (!(valueModels && valueModels.length)) {
                        model.trigger('select', model);
                    }
                }
            },

            __select: function(model) {
                model.selected = true;
                this.__setValue(model.id);
            },

            __deselect: function(model) {
                model.selected = false;
                this.__unsetValue(model.id);
            },

            __selectAll: function() {
                this.collection.each(function(model) {
                    model.trigger('select', model);
                }.bind(this));
            },

            __deselectAll: function() {
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
                    each(function(rejectedValue) {
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
                if (_.contains(this.tempValue, value)) {
                    return;
                }

                this.tempValue = this.tempValue.concat(value);
            },

            __unsetValue: function(value) {
                if (!_.contains(this.tempValue, value)) {
                    return;
                }

                this.tempValue = _.without(this.tempValue, value);
            },

            __applyValue: function() {
                this.setValue(this.tempValue);
                this.__trimValues();
                this.__triggerChange();
                this.dropdownView.close();
            },

            __resetValue: function() {
                var value = this.getValue();
                this.tempValue = value === null ? [] : value;

                this.collection.each(function(model) {
                    delete model.selected;
                });
                
                var valueModels = this.__findModels(this.tempValue) || null;
                _.each(valueModels, function(valueModel) {
                    valueModel.trigger('select', valueModel);
                });
            },

            onPanelOpen: function() {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                    this.__resetValue();
                }
            },

            onPanelClose: function() {
                if (!this.options.explicitApply) {
                    this.__applyValue();
                }

                this.viewModel.get('button').set('value', this.__findModels(this.getValue()));
            }
        });

        return Backbone.Form.editors.MultiSelect;
    }
);
