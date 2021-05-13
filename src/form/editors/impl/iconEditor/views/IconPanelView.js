import template from '../templates/iconPanel.html';
import IconCollectionView from './IconCollectionView';
import IconItemCategoryView from './IconItemCategoryView';

const typingDelay = 300;

export default Marionette.View.extend({
    initialize() {
        this.iconGroupsCollection = this.options.collection;
    },

    template: Handlebars.compile(template),

    className: 'dropdown__wrp dropdown__icons',

    regions: {
        searchInputRegion: '.js-search-input-region',
        searchAreaRegion: '.js-search-area',
        collectionAreaRegion: {
            el: '.js-collection-area',
            replaceElement: true
        },
        colorPickerRegion: '.js-color-picker-region'
    },

    ui: {
        colorPickerTitle: '.js-color-picker-title'
    },

    modelEvents() {
        return {
            'change:searchKey': _.debounce(this.__changeSearchKey, typingDelay)
        };
    },

    onRender() {
        this.search = new Core.form.editors.TextEditor({
            model: this.model,
            key: 'searchKey',
            changeMode: 'keydown',
            autocommit: true
        });

        if (this.options.showColorPicker) {
            this.ui.colorPickerTitle[0].removeAttribute('hidden');

            this.colorPicker = new Core.form.editors.ColorPickerEditor({
                model: this.model,
                key: 'color',
                changeMode: 'keydown',
                autocommit: true
            });

            this.listenTo(this.colorPicker, 'attach', () => {
                this.getRegion('colorPickerRegion').el.removeAttribute('hidden');
            });

            this.showChildView('colorPickerRegion', this.colorPicker);
        }

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

    __changeSearchKey(model, searchKey) {
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

        const iconItemCategoryView = new IconItemCategoryView({
            model
        });

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
    },

    __setIconsColor() {
        this.getRegion('collectionAreaRegion').el.style.color = this.model.get('color');
    }
});
