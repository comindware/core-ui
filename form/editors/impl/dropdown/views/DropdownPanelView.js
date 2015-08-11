/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['module/lib',
        'text!../templates/dropdownPanel.html',
        './DefaultDropdownListItemView',
        'core/list/listApi',
        'core/utils/utilsApi'
    ],
    function (lib, template, DefaultDropdownListItemView, list, utils) {
        'use strict';

        var config = {
            CHILD_HEIGHT: 34,
            MAX_HEIGHT: 410
        };

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                utils.helpers.ensureOption(options, 'model');
                utils.helpers.ensureOption(options, 'reqres');

                this.reqres = options.reqres;
            },

            attributes: {
                tabindex: 0
            },

            className: 'dev-dropdown-editor__dropdown-view__panel-view',

            template: Handlebars.compile(template),

            regions: {
                listRegion: '.js-list-region',
                scrollbarRegion: '.js-scrollbar-region'
            },

            onShow: function () {
                var displayAttribute = this.model.get('displayAttribute');
                var virtualCollection = this.model.get('virtualCollection');
                if (!virtualCollection) {
                    var collection = this.model.get('collection');
                    if (collection.comparator === undefined) {
                        collection.comparator = function (model) {
                            return (_.result(model.toJSON(), displayAttribute) || '').toString().toLowerCase();
                        };
                    }
                    if (collection.comparator) {
                        collection.sort();
                    }
                    virtualCollection = list.factory.createWrappedCollection(collection, {
                        selectableBehavior: 'single',
                        comparator: collection.comparator
                    });
                    this.model.set('virtualCollection', virtualCollection);
                } else {
                    virtualCollection.deselect();
                }
                var valueModel = this.model.get('value');
                if (valueModel) {
                    valueModel.select();
                }

                var result = list.factory.createDefaultList({
                    collection: virtualCollection,
                    listViewOptions: {
                        childView: DefaultDropdownListItemView,
                        childViewOptions: {
                            reqres: this.reqres,
                            displayAttribute: this.model.get('displayAttribute')
                        },
                        maxRows: Math.floor(config.MAX_HEIGHT / config.CHILD_HEIGHT),
                        childHeight: config.CHILD_HEIGHT
                    }
                });

                this.listView = result.listView;
                this.eventAggregator = result.eventAggregator;

                this.listRegion.show(result.listView);
                this.scrollbarRegion.show(result.scrollbarView);

                this.$el.focus();
                this.__assignKeyboardShortcuts();
            },

            __assignKeyboardShortcuts: function ()
            {
                if (this.keyListener) {
                    this.keyListener.reset();
                }

                var listShortcuts = {};
                _.each(this.listView.keyboardShortcuts, function (v, k) {
                    listShortcuts[k] = v.bind(this.listView);
                }.bind(this));
                var actualShortcuts = _.extend({}, listShortcuts, this.keyboardShortcuts);

                this.keyListener = new lib.keypress.Listener(this.el);
                _.each(actualShortcuts, function (value, key) {
                    var keys = key.split(',');
                    _.each(keys, function (k) {
                        this.keyListener.simple_combo(k, value.bind(this));
                    }, this);
                }, this);
            },

            keyboardShortcuts: {
                'enter,num_enter': function () {
                    if (this.isLoading) {
                        return;
                    }
                    var selectedModel = this.model.get('virtualCollection').selected;
                    this.reqres.request('value:set', selectedModel);
                }
            }
        });
    });
