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
        _.bindAll(this, '__onSelectedItemsSelect', '__moveRight', '__moveLeft', '__moveRightAll', '__moveLeftAll');
        this.eventAggregator = [];

        this.model.set('isDisplayedAvailable', false);
        this.model.set('isDisplayedSelected', false);
    },

    template: Handlebars.compile(template),

    className: 'columns-select',

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
        selectedItemsListRegion: '.js-selected-items-list-region',
        selectedItemsToolbarRegion: '.js-selected-items-toolbar-region'
    },

    onRender() {
        const maxQuantitySelected = this.model.get('maxQuantitySelected');

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

    onAttach() {
        const availableList = new Core.list.controllers.GridController({
            collection: this.model.get('available'),
            selectableBehavior: 'multi',
            showSearch: true,
            showSelection: true,
            showHeader: false,
            columns: [
                {
                    title: 'name',
                    type: 'String',
                    key: 'name'
                }
            ],
            listViewOptions: {
                height: 'auto',
                childView: MembersListItemView,
                childHeight: config.CHILD_HEIGHT,
                emptyViewOptions: {
                    text: this.model.get('emptyListText')
                },
                maxRows: 10,
                childViewSelector: this.options.childViewSelector
            }
        }).view;

        availableList.on('childview:dblclick', this.__moveRight);

        this.showChildView('availableItemsListRegion', availableList);

        const selectedList = new Core.list.controllers.GridController({
            collection: this.model.get('selected'),
            selectableBehavior: 'multi',
            columns: [
                {
                    title: 'name',
                    type: 'String',
                    key: 'name'
                }
            ],
            showSearch: true,
            showHeader: false,
            listViewOptions: {
                height: 'auto',
                childView: MembersListItemView,
                childHeight: config.CHILD_HEIGHT,
                emptyViewOptions: {
                    text: this.model.get('emptyListText')
                },
                maxRows: 10
            },
            showSelection: true
        }).view;

        selectedList.on('childview:dblclick', this.__moveLeft);

        this.showChildView('selectedItemsListRegion', selectedList);
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

    __onSelectedItemsSelect(id) {
        this.channel.trigger('items:select', 'selected', id);
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
