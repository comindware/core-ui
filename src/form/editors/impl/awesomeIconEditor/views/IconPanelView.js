/**
 * Developer: Zaycev Ivan
 * Date: 29.06.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */


import template from '../templates/iconPanel.html';
import IconCollectionView from './IconCollectionView';
import IconItemCategoryView from './IconItemCategoryView';

export default Marionette.LayoutView.extend({
    initialize() {
        this.iconGroupsCollection = this.options.collection;
    },

    template: Handlebars.compile(template),

    className: 'icons-panel',

    regions: {
        searchInputRegion: '.js-search-input-region',
        searchArea: '.js-search-area',
        collectionArea: '.js-collection-area'
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

        this.searchInputRegion.show(this.search);

        const iconCollectionView = new IconCollectionView({
            collection: this.options.collection
        });

        this.collectionArea.show(iconCollectionView);
        this.listenTo(iconCollectionView, 'click:item', id => this.trigger('click:item', id));
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

        this.searchArea.show(iconItemCategoryView);
        this.collectionArea.$el.hide();
        this.searchArea.$el.show();
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
                if (matchSearch(item.id) ||
                    item.filter.find(filterItem => matchSearch(filterItem)) ||
                    item.aliases.find(aliasesItem => matchSearch(aliasesItem))) {
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
