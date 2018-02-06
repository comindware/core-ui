/**
 * Created by sguryev on 13.07.2017.
 */
import utils from 'utils';
import SearchBarView from '../../views/SearchBarView';
import HighlightableBehavior from '../../collections/behaviors/HighlightableBehavior';
import factory from '../../nativeGrid/factory';
import template from '../templates/editableGrid.hbs';
import EditableGridHeaderToolbarView from '../views/EditableGridHeaderToolbarView';
import EditableGridHeaderView from '../views/EditableGridHeaderView';
import SelectionView from '../views/SelectionView';
import EditableGridCellViewFactory from '../services/EditableGridCellViewFactory';

const constants = {
    rowHeight: 25,
    defaultCollHeight: 44,
    defaultCheckBoxColumnWidth: 30
};

export default Marionette.View.extend({
    initialize(options) {
        this.collection = options.collection;
        this.collectionHeaderToolbarView = this.__createCollectionHeaderToolbarView();
        this.listenTo(this.collectionHeaderToolbarView, 'toolbar:execute:action', this.__executeAction);
        this.listenTo(this.collection, 'add remove reset', this.__setGridHeight);
    },

    ui: {
        collectionName: '.js-collection-name',
        grid: '.js-grid-region'
    },

    regions: {
        gridRegion: '.js-grid-region',
        collectionHeaderToolbarRegion: '.js-collection-header-toolbar-region',
        collectionHeaderSearchRegion: '.js-collection-header-search-region'
    },

    className: 'fr-collection dev-collection',

    template: Handlebars.compile(template),

    bindings: {
        name: {
            selector: '.js-name',
            elAttribute: 'text'
        },

        displayEmptyCollection: {
            selector: '.js-empty-collection',
            elAttribute: 'class'
        }
    },

    onRender() {
        this.__updateView();
        this.ui.collectionName.text(this.getOption('title') || '');
    },

    __updateView() {
        this.__showGridView();
        this.collectionHeaderToolbarRegion.show(this.collectionHeaderToolbarView);
        if (this.getOption('showSearch')) {
            this.__showSearch();
        }
    },

    __onCollectionChange() {
        this.__setGridHeight();
    },

    __getColumns() {
        return this.getOption('columns')
            .map(column => ({
                id: column.key,
                cellView: EditableGridCellViewFactory.getCellViewForColumn(column),
                viewModel: new Backbone.Model({ displayText: column.title }),
                sortAsc: utils.helpers.comparatorFor(utils.comparators.getComparatorByDataType(column.type, 'asc'), column.key),
                sortDesc: utils.helpers.comparatorFor(utils.comparators.getComparatorByDataType(column.type, 'desc'), column.key),
                width: column.width || 0,
            }));
    },

    __setGridHeight() {
        let heightPx = this.collection.length ? constants.defaultCollHeight : 0;
        if (this.options.isTree) {
            this.nativeGridCollection.forEach(model => {
                if (!model.hidden) {
                    heightPx += constants.rowHeight;
                }
            });
        } else {
            heightPx += this.collection.length > 0 ? this.collection.length * constants.rowHeight : constants.rowHeight;
        }
        this.ui.grid.css('height', heightPx);
    },

    __showGridView() {
        const columns = this.__getColumns();
        if (this.options.showSelectColumn !== false) {
            columns.unshift({
                id: 'selected',
                cellView: SelectionView,
                viewModel: new Backbone.Model({
                    displayText: '',
                    isCheckboxColumn: true,
                }),
                width: constants.defaultCheckBoxColumnWidth
            });
        }

        let nativeGridView;
        const gridOptions = {
            gridViewOptions: {
                columns,
                selectableBehavior: 'multi',
                childHeight: this.options.rowHeight,
                paddingRight: 1,
                paddingLeft: 1,
                expandOnShow: this.options.expandOnShow
            },
            headerView: EditableGridHeaderView,
            collection: this.collection
        };
        if (this.options.isTree) {
            nativeGridView = factory.createTreeGrid(gridOptions);
            this.listenTo(nativeGridView.collection, 'add remove reset', this.__setGridHeight);
        } else {
            nativeGridView = factory.createNativeGrid(gridOptions);
        }

        this.listenTo(nativeGridView, 'collapse:change', this.__setGridHeight);
        this.nativeGridCollection = nativeGridView.collection;
        if (this.options.showSelectColumn !== false) {
            this.listenTo(this.nativeGridCollection, 'check:all check:some check:none', this.__selectionChange);
        } else {
            this.listenTo(this.nativeGridCollection, 'select:all select:some select:none', this.__selectionChange);
        }
        this.showChildView('gridRegion', nativeGridView);
        this.__setGridHeight();
    },

    __addNewItem() {
        this.trigger('add');
    },

    __deleteItems(selectedItems) {
        if (selectedItems.length) {
            this.trigger('delete', selectedItems);
        }
    },

    __selectionChange() {
        this.collectionHeaderToolbarView.updateViewState(this.__getSelectedItems());
    },

    __createCollectionHeaderToolbarView() {
        const allowCreate = this.getOption('allowCreate');
        const allowDelete = this.getOption('allowDelete');
        return new EditableGridHeaderToolbarView({
            allowDelete: allowDelete === undefined ? true : allowDelete,
            allowCreate: allowCreate === undefined ? true : allowCreate
        });
    },

    __executeAction(actionKind) {
        const selectedItems = this.__getSelectedItems();
        switch (actionKind) {
            case 'create':
                this.__addNewItem();
                break;
            case 'delete':
                this.__deleteItems(selectedItems);
                break;
            default:
                break;
        }
    },

    __getSelectedItems() {
        if (this.options.showSelectColumn !== false) {
            return Object.values(this.nativeGridCollection.checked);
        }
        return Object.values(this.nativeGridCollection.selected);
    },

    __showSearch() {
        const searchView = new SearchBarView();
        this.collectionHeaderSearchRegion.show(searchView);
        searchView.on('search', text => {
            this.__collapse(this.nativeGridCollection);
            this.__unhighlightCollection(this.nativeGridCollection);
            this.isFiltered && this.__clearFilter(this.nativeGridCollection);
            this.isFiltered = !!text;
            if (text) {
                this.__applyFilter(this.nativeGridCollection, new RegExp(text, 'i'));
                this.__expand(this.nativeGridCollection, false);
                this.__highlightCollection(this.nativeGridCollection, text);
            }
        });
    },

    __applyFilter(collection, regexp) {
        collection.forEach(model => this.__hasChildren(model) && this.__applyFilter(model.get('children'), regexp));
        collection.filter(model => {
            let result = this.__hasChildren(model);
            const searchColumns = this.getOption('searchColumns') || ['text'];
            result = result || searchColumns.find(column => regexp.test(model.get(column)));
            return result;
        });
    },

    __highlightCollection(collection, text) {
        if (!(typeof collection.highlight === 'function')) {
            Core.utils.helpers.applyBehavior(collection, HighlightableBehavior);
        }
        collection.highlight(text);
        collection.each(model => {
            if (this.__hasChildren(model)) {
                this.__highlightCollection(model.children, text);
            }
        });
    },

    __unhighlightCollection(collection) {
        if (!(typeof collection.unhighlight === 'function')) {
            Core.utils.helpers.applyBehavior(collection, HighlightableBehavior);
        }
        collection.unhighlight();
        collection.each(model => {
            if (this.__hasChildren(model)) {
                this.__unhighlightCollection(model.children);
            }
        });
    },

    __clearFilter(collection) {
        collection.filter(null);
        collection.forEach(model => model.children && this.__clearFilter(model.children));
    },


    __collapse(collection) {
        collection.forEach(model => {
            if (typeof model.collapse === 'function') {
                model.collapse();
            }
            this.__hasChildren(model) && this.__collapse(model.children);
        });
    },

    __expand(collection) {
        collection.forEach(model => {
            if (typeof model.expand === 'function') {
                model.expand();
            }
            this.__hasChildren(model) && this.__expand(model.children);
        });
    },

    __hasChildren(model) {
        return model.children && model.children.length > 0;
    }
});
