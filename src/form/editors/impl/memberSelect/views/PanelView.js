/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { keypress } from '../../../../../libApi';
import list from '../../../../../list/listApi';
import dropdown from '../../../../../dropdown/dropdownApi';
import { helpers } from '../../../../../utils/utilsApi';
import template from '../templates/panel.hbs';
import ListItemView from './ListItemView';

const config = {
    CHILD_HEIGHT: 34,
    TEXT_FETCH_DELAY: 300
};

export default Marionette.LayoutView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'model');
        helpers.ensureOption(options, 'reqres');

        this.reqres = options.reqres;

        this.fetchDelayId = _.uniqueId('fetch-delay-id-');
    },

    className: 'dd-list',

    template: template,

    ui: {
        input: '.js-input'
    },

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor'
        }
    },

    events: {
        'keyup @ui.input': '__updateFilter',
        'change @ui.input': '__updateFilter',
        'input @ui.input': '__updateFilter'
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region',
        loadingRegion: '.js-loading-region'
    },

    onRender: function () {
        this.__assignKeyboardShortcuts();
    },

    onShow: function () {
        var result = list.factory.createDefaultList({
            collection: this.model.get('collection'),
            listViewOptions: {
                childView: ListItemView,
                childViewOptions: {
                    reqres: this.reqres
                },
                childHeight: config.CHILD_HEIGHT
            }
        });

        this.listView = result.listView;
        this.eventAggregator = result.eventAggregator;

        this.listRegion.show(result.listView);
        this.scrollbarRegion.show(result.scrollbarView);

        this.ui.input.focus();
        this.__updateFilter();
    },

    __assignKeyboardShortcuts: function ()
    {
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.ui.input[0]);
        _.each(this.keyboardShortcuts, function (value, key)
        {
            var keys = key.split(',');
            _.each(keys, function (k) {
                this.keyListener.simple_combo(k, value.bind(this));
            }, this);
        }, this);
    },

    keyboardShortcuts: {
        'up': function () {
            this.listView.moveCursorBy(-1, false);
        },
        'down': function () {
            this.listView.moveCursorBy(1, false);
        },
        'enter,num_enter': function () {
            if (this.isLoading) {
                return;
            }
            var selectedModel = this.model.get('collection').selected;
            this.reqres.request('value:set', selectedModel.id);
        }
    },

    __updateFilter: function () {
        var text = (this.ui.input.val() || '').trim();
        if (this.activeText === text) {
            return;
        }
        helpers.setUniqueTimeout(this.fetchDelayId, function () {
            this.activeText = text;
            var collection = this.model.get('collection');
            collection.deselect();
            this.reqres.request('filter:text', {
                text: text
            }).then(function () {
                if (collection.length > 0) {
                    var model = collection.at(0);
                    model.select();
                    this.eventAggregator.scrollTo(model);
                }
            }.bind(this));
        }.bind(this), config.TEXT_FETCH_DELAY);
    }
});
