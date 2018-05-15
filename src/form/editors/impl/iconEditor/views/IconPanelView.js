import template from '../templates/iconPanel.html';
import IconCollectionView from './IconCollectionView';
import IconItemCategoryView from './IconItemCategoryView';

export default Marionette.View.extend({
    initialize() {
        this.iconGroupsCollection = this.options.collection;
    },

    template: Handlebars.compile(template),

    className: 'icons-panel',

    regions: {
        searchInputRegion: '.js-search-input-region',
        searchAreaRegion: '.js-search-area',
        collectionAreaRegion: '.js-collection-area',
        colorPickerRegion: '.js-color-picker-region'
    },

    modelEvents: {
        'change:searchKey': '__changeSearchKey'
    },

    onRender() {
        this.search = new Core.form.editors.TextEditor({
            model: this.model,
            key: 'searchKey',
            changeMode: 'keydown',
            autocommit: true
        });

        this.colorPicker = new Core.form.editors.ColorPickerEditor({
            model: this.model,
            key: 'color',
            changeMode: 'keydown',
            autocommit: true
        });

        this.showChildView('colorPickerRegion', this.colorPicker);
        this.showChildView('searchInputRegion', this.search);

        const iconCollectionView = new IconCollectionView({
            collection: this.options.collection
        });

        this.showChildView('collectionAreaRegion', iconCollectionView);

        this.listenTo(iconCollectionView, 'click:item', id => this.trigger('click:item', id));
        this.listenTo(this.model, 'change:color', this.__setIconsColor);

        this.__setIconsColor();
        this.trigger('change:color', this.model.get('color'));
    },

    __changeSearchKey(model) {
        const value = model.get('searchKey');
        if (value && value.length) {
            const matchesItems = this.__searchItem(value);
            this.__showSearchResult(matchesItems);
        } else {
            this.collectionArea.$el.show();
            this.searchArea.$el.hide();
        }
    },

    __showSearchResult(matchesItems) {
        const model = new Backbone.Model({
            name: Localizer.get('MODULES.SEARCH.SEARCHTITLE'),
            groupItems: matchesItems
        });

        const iconItemCategoryView = new IconItemCategoryView({
            model
        });

        const searchAreaRegion = this.getRegion('searchAreaRegion');
        searchAreaRegion.show(iconItemCategoryView);
        searchAreaRegion.$el.hide();
        this.getRegion('searchArea').$el.show();
        this.listenTo(iconItemCategoryView, 'click:item', id => this.trigger('click:item', id));
    },

    __searchItem(value) {
        const matchesItems = [];
        const matchSearch = searchStr => {
            if (typeof searchStr !== 'string') {
                return;
            }

            const splitName = searchStr.split('-');
            return _.some(splitName, item => item.toLowerCase().indexOf(value) === 0);
        };

        this.iconGroupsCollection.each(groupItem => {
            _.each(groupItem.get('groupItems'), item => {
                if (
                    matchSearch(item.id) ||
                    (item.filter && item.filter.find(filterItem => matchSearch(filterItem))) ||
                    (item.aliases && item.aliases.find(aliasesItem => matchSearch(aliasesItem)))
                ) {
                    const isItemExistInCollection = _.some(matchesItems, matchesItem => item.id === matchesItem.id);
                    if (!matchesItems.length || !isItemExistInCollection) {
                        matchesItems.push(item);
                    }
                }
            });
        });
        return matchesItems;
    },

    __setIconsColor() {
        this.getRegion('collectionAreaRegion').$el.css({ color: this.model.get('color') });
    }
});
