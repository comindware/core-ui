/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars, keypress } from 'lib';
import template from '../templates/dropdownPanel.hbs';
import DefaultDropdownListItemView from './DefaultDropdownListItemView';
import DropdownCollection from '../collections/DropdownCollection';
import list from 'list';
import { helpers } from 'utils';

const config = {
    CHILD_HEIGHT: 25,
    MAX_HEIGHT: 410
};

const classes = {
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.LayoutView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'model');
        helpers.ensureOption(options, 'reqres');

        this.reqres = options.reqres;
    },

    className: 'dd-list',

    template: Handlebars.compile(template),

    events: {
        'keyup @ui.input': 'onFilter',
        'change @ui.input': 'onFilter',
        'input @ui.input': 'onFilter'
    },


    ui: {
        input: '.js-input'
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region'
    },

    templateHelpers: function () {
        return {
            enableSearch: this.options.enableSearch
        };
    },

    onRender: function () {
        if (this.options.enableSearch) {
            this.$el.addClass('dd-list_search');
        }
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
                virtualCollection = new DropdownCollection(collection, {
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
                emptyViewOptions: {
                    className: classes.EMPTY_VIEW
                },
                maxRows: Math.floor(config.MAX_HEIGHT / config.CHILD_HEIGHT),
                height: 'auto',
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

        this.keyListener = new keypress.Listener(this.el);
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
    },

    onFilter: function () {
        var text = (this.ui.input.val() || '').trim();
        if (this.activeText === text) {
            return;
        }
        helpers.setUniqueTimeout(this.fetchDelayId, function () {
            this.activeText = text;
            var collection = this.model.get('virtualCollection');
            collection.deselect();

            text = text.toLocaleLowerCase();
            collection.unhighlight();
            if (text === '') {
                collection.filter(null);
            } else {
                collection.filter(function (model) {
                    var itemText = (model.get(this.model.get('displayAttribute')) || '').toLocaleLowerCase();
                    return itemText.indexOf(text) !== -1;
                }.bind(this));
                collection.highlight(text);
            }

            if (collection.length > 0) {
                var model = collection.at(0);
                model.select();
            }
        }.bind(this), config.TEXT_FETCH_DELAY);
    }
});
