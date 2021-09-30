import template from '../templates/iconPanel.html';
import IconCollectionView from './IconCollectionView';
import IconItemCategoryView from './IconItemCategoryView';

const typingDelay = 300;

export default Marionette.View.extend({
    initialize() {
        this.iconGroupsCollection = this.options.collection;
    },

    template: Handlebars.compile(template),

    className: 'icons-panel-container',

    regions: {
        searchInputRegion: '.js-search-input-region',
        searchAreaRegion: '.js-search-area-region',
        collectionAreaRegion: '.js-collection-area-region'
    },

    modelEvents() {
        return {
            'change:searchKey': _.debounce(this.__changeSearchKey, typingDelay)
        };
    },

    onRender() {
        const searchView = new Core.views.SearchBarView();
        const iconCollectionView = new IconCollectionView({ collection: this.options.collection });
        searchView.on('search', text => this.__changeSearchKey(text));
        this.showChildView('searchInputRegion', searchView);
        this.showChildView('collectionAreaRegion', iconCollectionView);
        this.listenTo(iconCollectionView, 'click:item', id => this.trigger('click:item', id));
        this.listenTo(this.model, 'change:color', this.__setIconsColor);
    },

    __changeSearchKey(searchKey) {
        if (searchKey) {
            const matchesItems = this.__searchItem(searchKey);
            this.__showSearchResult(matchesItems);
        } else {
            this.getRegion('collectionAreaRegion').el.removeAttribute('hidden');
            this.getRegion('searchAreaRegion').el.setAttribute('hidden', true);
        }
    },

    __showSearchResult(matchesItems) {
        const model = new Backbone.Model({
            name: Localizer.get('CORE.FORM.EDITORS.ICONEDITOR.SEARCHTITLE'),
            groupItems: matchesItems
        });
        const iconItemCategoryView = new IconItemCategoryView({ model });
        const searchAreaRegion = this.getRegion('searchAreaRegion');
        searchAreaRegion.show(iconItemCategoryView);
        searchAreaRegion.el.removeAttribute('hidden');
        this.getRegion('collectionAreaRegion').el.setAttribute('hidden', true);
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
                if (matchSearch(item.id) || (item.filter && item.filter.find(filterItem => matchSearch(filterItem)))) {
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
