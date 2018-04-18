import template from '../templates/membersSplitPanel.html';
import MembersListItemView from './MembersListItemView';
import MembersToolbarView from './membersToolbarView';
import helpers from '../../../../../utils/helpers';

const config = {
    CHILD_HEIGHT: 34
};

export default Marionette.View.extend({
    constructor(options) {
        Marionette.View.prototype.constructor.apply(this, arguments);
        this.channel = options.channel;
        _.bindAll(this, '__onSelectedItemsSelect', '__onSelectedSearch', '__moveRight', '__moveLeft', '__moveRightAll', '__moveLeftAll');
        this.eventAggregator = [];

        this.model.set('isDisplayedAvailable', false);
        this.model.set('isDisplayedSelected', false);
    },

    template: Handlebars.compile(template),

    className: 'columns-select',

    ui: {
        availableSearchRegion: '.js-available-search-region',
        selectedSearchRegion: '.js-selected-search-region',
        maxQuantityInfo: '.js-max-quantity-info'
    },

    events: {
        'click .js-move-right-button': '__moveRight',
        'click .js-move-left-button': '__moveLeft',
        'click .js-move-right-all-button': '__moveRightAll',
        'click .js-move-left-all-button': '__moveLeftAll',
        'dblclick .js-available-items-list-region .js-menu-select-item': '__moveRight',
        'dblclick .js-selected-items-list-region .js-menu-select-item': '__moveLeft'
    },

    regions: {
        availableItemsListRegion: '.js-available-items-list-region',
        availableItemsToolbarRegion: '.js-available-items-toolbar-region',
        availableSearchRegion: '.js-available-search-region',
        selectedItemsListRegion: '.js-selected-items-list-region',
        selectedItemsToolbarRegion: '.js-selected-items-toolbar-region',
        selectedSearchRegion: '.js-selected-search-region'
    },

    onRender() {
        const maxQuantitySelected = this.model.get('maxQuantitySelected');
        if (maxQuantitySelected) {
            this.ui.maxQuantityInfo.text(helpers.getPluralForm(maxQuantitySelected, this.options.maxQuantityText).replace('{0}', maxQuantitySelected));
        }

        // Available list
        const availableViewOptions = {
            collection: this.model.get('available'),
            listViewOptions: {
                height: 'auto',
                childView: MembersListItemView,
                childHeight: config.CHILD_HEIGHT,
                emptyViewOptions: {
                    text: this.model.get('emptyListText')
                },
                childViewOptions: {
                    channel: this.channel,
                    left: true
                },
                maxRows: 10
            }
        };
        if (this.options.childViewSelector) {
            availableViewOptions.listViewOptions.childViewSelector = this.options.childViewSelector;
        }
        const availableList = Core.list.factory.createDefaultList(availableViewOptions);
        this.showChildView('availableItemsListRegion', availableList);
        // Available search
        const availableSearchView = new Core.views.SearchBarView({ placeholder: this.model.get('searchPlaceholder') });
        this.showChildView('availableSearchRegion', availableSearchView);
        this.listenTo(availableSearchView, 'search', this.__onAvailableSearch);
        // Selected list
        const selectedList = Core.list.factory.createDefaultList({
            collection: this.model.get('selected'),
            listViewOptions: {
                height: 'auto',
                childView: MembersListItemView,
                childHeight: config.CHILD_HEIGHT,
                emptyViewOptions: {
                    text: this.model.get('emptyListText')
                },
                childViewOptions: {
                    channel: this.channel,
                    left: false
                },
                maxRows: 10
            }
        });
        this.showChildView('selectedItemsListRegion', selectedList);

        // Selected search
        const selectedSearchView = new Core.views.SearchBarView({ placeholder: this.model.get('searchPlaceholder') });
        this.showChildView('selectedSearchRegion', selectedSearchView);
        this.listenTo(selectedSearchView, 'search', this.__onSelectedSearch);

        if (this.model.get('showToolbar')) {
            // Available toolbar
            const availableItemsToolbarView = new MembersToolbarView({
                model: this.model
            });
            this.listenTo(availableItemsToolbarView, 'select', this.__onAvailableItemsSelect);
            this.showChildView('availableItemsToolbarRegion', availableItemsToolbarView);

            // Selected toolbar
            const selectedMembersToolbarView = new MembersToolbarView({
                model: this.model
            });
            this.showChildView('selectedItemsToolbarRegion', selectedMembersToolbarView);
            this.listenTo(selectedMembersToolbarView, 'select', this.__onSelectedItemsSelect);
        }
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
