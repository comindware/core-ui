/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { keypress } from '../../../../../libApi';
import { helpers } from '../../../../../utils/utilsApi';
import list from '../../../../../list/listApi';
import template from '../templates/referencePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';
import LoadingView from './LoadingView';
import AddNewButtonView from './AddNewButtonView';

const config = {
    CHILD_HEIGHT: 30,
    TEXT_FETCH_DELAY: 300
};

export default Marionette.LayoutView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'model');
        helpers.ensureOption(options, 'reqres');

        this.reqres = options.reqres;
        this.showAddNewButton = this.options.showAddNewButton;
        this.fetchDelayId = _.uniqueId('fetch-delay-id-');
    },

    className: 'dd-list dd-list_reference',

    template: template,

    templateHelpers: function () {
        var value = this.model.get('value');
        return {
            text: (value && (value.get('text') || '#' + value.id)) || '',
            showAddNewButton: this.showAddNewButton
        };
    },

    ui: {
        input: '.js-input',
        clear: '.js-clear'
    },

    events: {
        'keyup @ui.input': '__updateFilter',
        'change @ui.input': '__updateFilter',
        'input @ui.input': '__updateFilter',
        'click @ui.clear': '__clear'
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region',
        loadingRegion: '.js-loading-region',
        addNewButtonRegion: '.js-add-new-button-region'
    },

    onRender: function () {
        this.__assignKeyboardShortcuts();
    },

    onShow: function () {
        var result = list.factory.createDefaultList({
            collection: this.model.get('collection'),
            listViewOptions: {
                childView: this.options.listItemView,
                childViewOptions: {
                    reqres: this.reqres
                },
                emptyViewOptions: {
                    text: LocalizationService.get('CORE.FORM.EDITORS.REFERENCE.NOITEMS')
                },
                childHeight: config.CHILD_HEIGHT
            }
        });

        this.listView = result.listView;
        this.eventAggregator = result.eventAggregator;

        if(this.showAddNewButton) {
            this.$el.addClass('dd-list_reference-button');
            var addNewButton = new AddNewButtonView({reqres: this.reqres});
            this.addNewButtonRegion.show(addNewButton);
        }

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
            this.reqres.request('value:set', selectedModel);
        }
    },

    __clear: function () {
        this.reqres.request('value:set', null);
    },

    __updateFilter: function () {
        var text = (this.ui.input.val() || '').trim();
        if (this.activeText === text) {
            return;
        }
        helpers.setUniqueTimeout(this.fetchDelayId, function () {
            this.activeText = text;
            this.__setLoading(true);
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

                this.__setLoading(false);
            }.bind(this));
        }.bind(this), config.TEXT_FETCH_DELAY);
    },

    __setLoading: function (isLoading) {
        if (this.isDestroyed) {
            return false;
        }
        this.isLoading = isLoading;
        if (isLoading) {
            this.loadingRegion.show(new LoadingView());
        } else {
            this.loadingRegion.reset();
        }
    }
});