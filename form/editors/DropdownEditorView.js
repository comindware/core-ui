/**
 * Developer: Stepan Burguchev
 * Date: 1/16/2015
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
        'core/list/listApi',
        'core/dropdown/dropdownApi',
        'text!./templates/dropdownEditor.html',
        './base/BaseLayoutEditorView',
        './impl/dropdown/views/DropdownPanelView',
        './impl/dropdown/views/DropdownButtonView'
    ],
    function (lib, list, dropdown, template, BaseLayoutEditorView, DropdownPanelView, DropdownButtonView) {
        'use strict';

        var classes = {
        };

        var defaultOptions = {
            collection: null,
            displayAttribute: 'text',
            allowEmptyValue: true,
            enableSearch: false
        };

        /**
         * @name DropdownEditorView
         * @memberof module:core.form.editors
         * @class Редактор для выбора значения из выпадающего списка. Тип данных редактируемого значения должен
         * совпадать с типом данных поля <code>id</code> элементов коллекции <code>collection</code>.
         * @extends module:core.form.editors.base.BaseEditorView
         * @param {Object} options Объект опций. Также поддерживаются все опции базового класса
         * {@link module:core.form.editors.base.BaseEditorView BaseEditorView}.
         * @param {Boolean} [options.allowEmptyValue=true] Разрешить значение <code>null</code>.
         * @param {Backbone.Collection|Array} options.collection Массив объектов <code>{ id, text }</code> или
         * Backbone коллекция моделей с такими атрибутами. Используйте свойство <code>displayAttribute</code> для отображения
         * текста из поля, отличного от <code>text</code>. В случае передачи Backbone.Collection, дальнейшее ее изменение
         * отражается в выпадающем списке.
         * @param {String} [options.displayAttribute='text'] Имя атрибута, используемого для отображения текста.
         * @param {Boolean} [options.enableSearch=false] Отображать строку поиска в выпадающей панели.
         * */
        Backbone.Form.editors.Dropdown = BaseLayoutEditorView.extend({
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                _.bindAll(this, '__onCollectionChange');

                this.reqres = new Backbone.Wreqr.RequestResponse();

                this.reqres.setHandler('value:set', this.onValueSet, this);
                this.reqres.setHandler('panel:open', this.onPanelOpen, this);

                if (_.isArray(this.options.collection)) {
                    this.options.collection = new Backbone.Collection(this.options.collection);
                }

                this.collection = this.options.collection;
                
                // adding ListItem behavior to collection model
                var fixModel = function (model) {
                    _.extend(model, new list.models.behaviors.ListItemBehavior(model));
                };
                this.collection.each(fixModel);
                var oldModel = this.collection.model;
                this.collection.model = oldModel.extend({
                    initialize: function () {
                        oldModel.prototype.initialize.apply(this, arguments);
                        fixModel(this);
                    }
                });

                this.listenTo(this.collection, 'add', this.__onCollectionChange);
                this.listenTo(this.collection, 'remove', this.__onCollectionChange);
                this.listenTo(this.collection, 'reset', this.__onCollectionChange);

                this.viewModel = new Backbone.Model({
                    button: new Backbone.Model({
                        value: this.__findModel(this.getValue()),
                        displayAttribute: this.options.displayAttribute
                    }),
                    panel: new Backbone.Model({
                        collection: this.collection,
                        value: this.__findModel(this.getValue()),
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

            className: 'dropdown-view',

            template: Handlebars.compile(template),

            setValue: function (value) {
                this.__value(value, false);
            },

            onRender: function () {
                this.__assignKeyboardShortcuts();
                this.dropdownView = dropdown.factory.createDropdown({
                    buttonView: DropdownButtonView,
                    buttonViewOptions: {
                        model: this.viewModel.get('button'),
                        reqres: this.reqres
                    },
                    panelView: DropdownPanelView,
                    panelViewOptions: {
                        model: this.viewModel.get('panel'),
                        reqres: this.reqres,
                        enableSearch: this.options.enableSearch
                    },
                    autoOpen: false
                });
                this.dropdownRegion.show(this.dropdownView);
            },

            __onCollectionChange: function () {
                var value = this.getValue();
                var valueModel = this.collection.findWhere({id: value});
                if (valueModel !== null) {
                    if (valueModel !== this.viewModel.get('button').get("value")) {
                        this.viewModel.get('button').set('value', valueModel);
                    }
                    if (valueModel !== this.viewModel.get('panel').get("value")) {
                        this.viewModel.get('panel').set('value', valueModel);
                    }

                    return;
                }

                if (this.options.allowEmptyValue || this.collection.length === null) {
                    this.setValue(null);
                } else {
                    this.setValue(this.collection.at(0).id);
                }
            },

            __findModel: function (value) {
                return this.collection ? this.collection.findWhere({ id: value }) : null;
            },

            __assignKeyboardShortcuts: function () {
                if (this.keyListener) {
                    this.keyListener.reset();
                }
                this.keyListener = new lib.keypress.Listener(this.el);
                _.each('enter,num_enter'.split(','), function (key) {
                    this.keyListener.simple_combo(key, function () {
                        if (this.getEnabled() && !this.getReadonly()) {
                            this.dropdownView.open();
                        }
                    }.bind(this));
                }, this);
                this.keyListener.simple_combo('up', function () {
                    if (this.collection.length === 0) {
                        this.__value(null, true);
                    }
                    var model = this.__findModel(this.getValue());
                    var index = this.collection.indexOf(model);
                    var nextIndex = 0;
                    if (index > 0) {
                        nextIndex = index - 1;
                    }
                    var nextModel = this.collection.at(nextIndex);
                    this.__value(nextModel.id, true);
                }.bind(this));
                this.keyListener.simple_combo('down', function () {
                    if (this.collection.length === 0) {
                        this.__value(null, true);
                    }
                    var model = this.__findModel(this.getValue());
                    var index = this.collection.indexOf(model);
                    if (index !== -1 && index < this.collection.length - 1) {
                        var nextIndex = index + 1;
                        var nextModel = this.collection.at(nextIndex);
                        this.__value(nextModel.id, true);
                    }
                }.bind(this));
            },

            __value: function (value, triggerChange) {
                if (this.value === value) {
                    return;
                }
                this.value = value;
                var valueModel = this.__findModel(value) || null;
                this.viewModel.get('button').set('value', valueModel);
                this.viewModel.get('panel').set('value', valueModel);
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            onValueSet: function (o) {
                this.__value(o.id, true);
                this.dropdownView.close();
                this.$el.focus();
            },

            onPanelOpen: function () {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            }
        });

        return Backbone.Form.editors.Dropdown;
    });
