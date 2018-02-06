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


import template from '../templates/itemsPanel.html';

const config = {
    CHILD_HEIGHT: 34
};

export default Marionette.View.extend({
    constructor(options) {
        Marionette.View.prototype.constructor.apply(this, arguments);
        this.channel = options.channel;
        _.bindAll(this,
            '__onAvailableItemsSelect',
            '__onAvailableSearch',
            '__onSelectedItemsSelect',
            '__onSelectedSearch',
            '__moveRight',
            '__moveLeft',
            '__moveRightAll',
            '__moveLeftAll',
            '__reject',
            '__accept'
        );
        this.eventAggregator = [];

        this.model.set('isDisplayedAvailable', false);
        this.model.set('isDisplayedSelected', false);
    },

    template: Handlebars.compile(template),

    className: 'l-popup l-popup_two-columns',

    ui: {
        availableSearchRegion: '.js-available-search-region',
        selectedSearchRegion: '.js-selected-search-region',
        maxQuantityInfo: '.js-max-quantity-info',
        confirmPanel: '.js-confirm-panel'
    },

    events: {
        'click .js-move-right-button': '__moveRight',
        'click .js-move-left-button': '__moveLeft',
        'click .js-move-right-all-button': '__moveRightAll',
        'click .js-move-left-all-button': '__moveLeftAll',
        'click .js-reject': '__reject',
        'click .js-accept': '__accept',
        'dblclick .js-available-items-list-region .js-menu-select-item': '__moveRight',
        'dblclick .js-selected-items-list-region .js-menu-select-item': '__moveLeft'
    },

    regions: {
        availableItemsListRegion: '.js-available-items-list-region',
        availableItemsScrollbarRegion: '.js-available-items-scrollbar-region',
        availableItemsToolbarRegion: '.js-available-items-toolbar-region',
        availableSearchRegion: '.js-available-search-region',
        selectedItemsListRegion: '.js-selected-items-list-region',
        selectedItemsScrollbarRegion: '.js-selected-items-scrollbar-region',
        selectedItemsToolbarRegion: '.js-selected-items-toolbar-region',
        selectedSearchRegion: '.js-selected-search-region'
    },

    onRender() {
        const maxQuantitySelected = this.model.get('maxQuantitySelected');
        if (maxQuantitySelected) {
            this.ui.maxQuantityInfo.text(
                Core.utils.helpers.getPluralForm(maxQuantitySelected, this.options.maxQuantityText).replace('{0}', maxQuantitySelected));
        }

        // Available list
        const availableViewOptions = {
            collection: this.model.get('available'),
            listViewOptions: {
                childView: this.options.itemListItemView,
                childHeight: config.CHILD_HEIGHT,
                emptyViewOptions: {
                    text: this.model.get('emptyListText')
                },
                childViewOptions: {
                    channel: this.channel,
                    left: true
                }
            }
        };
        if (this.options.childViewSelector) {
            availableViewOptions.listViewOptions.childViewSelector = this.options.childViewSelector;
        }
        const availableList = Core.list.factory.createDefaultList(availableViewOptions);
        this.availableItemsListRegion.show(availableList.listView);
        this.availableItemsScrollbarRegion.show(availableList.scrollbarView);

        if (this.eventAggregator.available) {
            this.stopListening(this.eventAggregator.available);
        }
        this.eventAggregator.available = new Core.list.EventAggregator({
            views: [availableList.scrollbarView, availableList.listView],
            collection: this.model.get('available')
        });
        // Available search
        const availableSearchView = new Core.views.SearchBarView({ placeholder: this.model.get('searchPlaceholder') });
        this.availableSearchRegion.show(availableSearchView);
        this.listenTo(availableSearchView, 'search', this.__onAvailableSearch);
        // Selected list
        const selectedList = Core.list.factory.createDefaultList({
            collection: this.model.get('selected'),
            listViewOptions: {
                childView: this.options.itemListItemView,
                childHeight: config.CHILD_HEIGHT,
                emptyViewOptions: {
                    text: this.model.get('emptyListText')
                },
                childViewOptions: {
                    channel: this.channel,
                    left: false
                }
            }
        });
        this.selectedItemsListRegion.show(selectedList.listView);
        this.selectedItemsScrollbarRegion.show(selectedList.scrollbarView);

        // Selected search
        const selectedSearchView = new Core.views.SearchBarView({ placeholder: this.model.get('searchPlaceholder') });
        this.selectedSearchRegion.show(selectedSearchView);
        this.listenTo(selectedSearchView, 'search', this.__onSelectedSearch);

        if (this.model.get('showToolbar')) {
            // Available toolbar
            const availableItemsToolbarView = new this.options.itemsToolbarView({
                model: this.model
            });
            this.listenTo(availableItemsToolbarView, 'select', this.__onAvailableItemsSelect);
            this.availableItemsToolbarRegion.show(availableItemsToolbarView);

            // Selected toolbar
            const selectedMembersToolbarView = new this.options.itemsToolbarView({
                model: this.model
            });
            this.selectedItemsToolbarRegion.show(selectedMembersToolbarView);
            this.listenTo(selectedMembersToolbarView, 'select', this.__onSelectedItemsSelect);
        }

        if (this.eventAggregator.selected) {
            this.stopListening(this.eventAggregator.selected);
        }
        this.eventAggregator.selected = new Core.list.EventAggregator({
            views: [selectedList.scrollbarView, selectedList.listView],
            collection: this.model.get('selected')
        });
    },

    __moveRight() {
        this.channel.trigger('items:move', 'available', 'selected');
    },

    __moveLeft() {
        this.channel.trigger('items:move', 'selected', 'available');
    },

    __moveRightAll() {
        this.channel.trigger('items:move', 'available', 'selected', true);
    },

    __moveLeftAll() {
        this.channel.trigger('items:move', 'selected', 'available', true);
    },

    __onAvailableItemsSelect(id) {
        this.channel.trigger('items:select', 'available', id);
    },

    __onAvailableSearch(value) {
        this.channel.trigger('items:search', 'available', value);
    },

    __onSelectedItemsSelect(id) {
        this.channel.trigger('items:select', 'selected', id);
    },

    __onSelectedSearch(value) {
        this.channel.trigger('items:search', 'selected', value);
    },

    __accept() {
        this.channel.trigger('items:update');
        Core.services.WindowService.closePopup();
    },

    __reject() {
        this.channel.trigger('items:cancel');
        Core.services.WindowService.closePopup();
    }
});
