
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
        collectionAreaRegion: '.js-collection-area'
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

        this.showChildView('searchInputRegion', this.search);

        const iconCollectionView = new IconCollectionView({
            collection: this.options.collection
        });

        this.collectionAreaRegion.show(iconCollectionView);
        this.listenTo(iconCollectionView, 'click:item', id => this.trigger('click:item', id));
    },

    __changeSearchKey(model) {
        const value = model.get('searchKey');
        if (value && value.length) {
            const matchesItems = this.__searchItem(value);
            this.__showSearchResult(matchesItems);
        } else {
            this.collectionAreaRegion.$el.show();
            this.searchAreaRegion.$el.hide();
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

        this.showChildView('searchAreaRegion', iconItemCategoryView);
        this.collectionAreaRegion.$el.hide();
        this.searchAreaRegion.$el.show();
        this.listenTo(iconItemCategoryView, 'click:item', id => this.trigger('click:item', id));
    },

    __searchItem(value) {
        const matchesItems = [];
        const matchSearch = searchStr => {
            if (typeof searchStr !== 'string') {
                return;
            }

            const splitName = searchStr.split('-');
            return splitName.some(item => item.toLowerCase().indexOf(value) === 0);
        };

        this.iconGroupsCollection.each(groupItem => {
            groupItem.get('groupItems').forEach(item => {
                if (matchSearch(item.id) ||
                    (item.filter && item.filter.find(filterItem => matchSearch(filterItem))) ||
                    (item.aliases && item.aliases.find(aliasesItem => matchSearch(aliasesItem)))) {
                    const isItemExistInCollection = _.some(matchesItems, matchesItem => item.id === matchesItem.id);
                    if (!matchesItems.length || !isItemExistInCollection) {
                        matchesItems.push(item);
                    }
                }
            });
        });
        return matchesItems;
    }
});
