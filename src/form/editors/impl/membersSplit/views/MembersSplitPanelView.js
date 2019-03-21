import template from '../templates/membersSplitPanel.html';
import MembersToolbarView from './membersToolbarView';
import ElementsQuantityWarningView from './ElementsQuantityWarningView';

const config = {
    CHILD_HEIGHT: 34
};

export default Marionette.View.extend({
    constructor(options) {
        Marionette.View.prototype.constructor.apply(this, arguments);
        this.channel = options.channel;
        _.bindAll(this, '__onSelectedItemsSelect', '__moveRight', '__moveLeft', '__moveRightAll', '__moveLeftAll');

        this.model.set('isDisplayedAvailable', false);
        this.model.set('isDisplayedSelected', false);
    },

    template: Handlebars.compile(template),

    className: 'columns-select',

    events: {
        'click .js-move-right-button': '__moveRight',
        'click .js-move-left-button': '__moveLeft',
        'click .js-move-right-all-button': '__moveRightAll',
        'click .js-move-left-all-button': '__moveLeftAll'
    },

    regions: {
        availableItemsListRegion: '.js-available-items-list-region',
        availableItemsToolbarRegion: '.js-available-items-toolbar-region',
        selectedItemsListRegion: '.js-selected-items-list-region',
        selectedItemsToolbarRegion: '.js-selected-items-toolbar-region',
        elementsQuantityWarningRegion: '.js-elements-quantity-warning-region'
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
        const availableList = (this.availableList = new Core.list.GridView({
            collection: this.model.get('available'),
            selectableBehavior: 'multi',
            showSearch: true,
            handleSearch: false,
            showCheckbox: true,
            showHeader: false,
            columns: [
                {
                    title: 'name',
                    type: 'String',
                    key: 'name'
                }
            ],
            emptyViewOptions: {
                text: this.model.get('emptyListText')
            },
            maxRows: 10
        }));

        availableList.on('dblclick', this.__moveRight);
        availableList.on('dblclick', this.__moveRight);
        availableList.on('search', text => this.channel.trigger('items:search', text, 'available'));
        this.listenTo(availableList, 'dblclick', this.__moveRight);
        this.showChildView('elementsQuantityWarningRegion', new ElementsQuantityWarningView());
        this.toggleElementsQuantityWarning();

        this.showChildView('availableItemsListRegion', availableList);

        const selectedList = new Core.list.GridView({
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
            handleSearch: false,
            showHeader: false,
            height: 'auto',
            emptyViewOptions: {
                text: this.model.get('emptyListText')
            },
            maxRows: 10,
            showCheckbox: true
        });

        selectedList.on('dblclick', this.__moveLeft);
        selectedList.on('search', text => this.channel.trigger('items:search', text, 'selected'));

        this.listenTo(this.model.get('available'), 'move:right enter', this.__moveRight);
        this.listenTo(this.model.get('selected'), 'move:left enter', this.__moveLeft);

        this.showChildView('selectedItemsListRegion', selectedList);
    },

    __moveRight(model) {
        this.channel.trigger('items:move', 'available', 'selected', false, model instanceof Backbone.Model && model);
    },

    __moveLeft(model) {
        this.channel.trigger('items:move', 'selected', 'available', false, model instanceof Backbone.Model && model);
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
    },

    setLoading(state) {
        this.availableList && !this.availableList.isDestroyed() && this.availableList.setLoading(state);
    },

    toggleElementsQuantityWarning() {
        if (this.isDestroyed()) {
            return;
        }
        const collection = this.model.get('available');
        const warningRegion = this.getRegion('elementsQuantityWarningRegion');
        warningRegion.$el.toggle(collection.length < collection.totalCount);
    }
});
