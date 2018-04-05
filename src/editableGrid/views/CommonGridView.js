import utils from 'utils';
import SearchBarView from '../../views/SearchBarView';
import factory from '../../nativeGrid/factory';
import template from '../templates/editableGrid.hbs';
import ToolbarView from '../../components/toolbar/ToolbarView';
import EditableGridCellViewFactory from '../services/EditableGridCellViewFactory';

const constants = {
    rowHeight: 25,
    defaultCollHeight: 44,
    defaultCheckBoxColumnWidth: 30
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        this.collection = options.collection;
        this.collectionHeaderToolbarView = new ToolbarView({
            allItemsCollection: options.actions
        });
        this.listenTo(this.collectionHeaderToolbarView, 'command:execute', this.__executeAction);
        this.listenTo(this.collection, 'add remove reset', this.__setGridHeight);
    },

    ui: {
        collectionName: '.js-collection-name',
        grid: '.js-grid-region'
    },

    regions: {
        gridRegion: '.js-grid-region',
        collectionHeaderToolbarRegion: '.js-editable-grid-header-toolbar-region',
        collectionHeaderSearchRegion: '.js-editable-grid-header-search-region'
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

    onShow() {
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
        return this.getOption('columns').map(column => ({
            id: column.key,
            cellView: EditableGridCellViewFactory.getCellViewForColumn(column),
            viewModel: new Backbone.Model({ displayText: column.title }),
            sortAsc: utils.helpers.comparatorFor(utils.comparators.getComparatorByDataType(column.type, 'asc'), column.key),
            sortDesc: utils.helpers.comparatorFor(utils.comparators.getComparatorByDataType(column.type, 'desc'), column.key),
            width: column.width || 0
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
        this.ui.grid.css('height', 500);
    },

    __showGridView() {
        const columns = this.options.columns;
        let nativeGridView;
        const gridOptions = {
            gridViewOptions: {
                columns,
                selectableBehavior: 'multi',
                expandOnShow: this.options.expandOnShow,
                height: this.options.height,
                maxRows: this.options.maxRows
            },
            collection: this.collection,
            childrenAttribute: this.options.childrenAttribute
        };
        if (this.options.isTree) {
            nativeGridView = factory.createTreeGrid(gridOptions);
            this.listenTo(nativeGridView.collection, 'add remove reset', this.__setGridHeight);
        } else {
            nativeGridView = factory.createNativeGrid(gridOptions);
        }
        this.nativeGridView = nativeGridView;

        this.listenTo(nativeGridView, 'collapse:change', this.__setGridHeight);
        this.listenTo(nativeGridView, 'childview:click', (...args) => this.trigger('item:click', ...args));
        this.listenTo(nativeGridView, 'childview:dblclick', (...args) => this.trigger('item:dblclick', ...args));
        this.nativeGridCollection = nativeGridView.collection;
        this.gridRegion.show(nativeGridView);
        this.__setGridHeight();
    },

    __executeAction(actionKind) {
        this.trigger('execute:action', actionKind);
    },

    __showSearch() {
        const searchView = new SearchBarView();
        this.collectionHeaderSearchRegion.show(searchView);
        searchView.on('search', text => {
            this.trigger('search', text);
            if (this.options.isTree) {
                this.__toggleCollapseAll(!this.isFiltered && !this.options.expandOnShow);
            }
        });
    },

    __toggleCollapseAll(collapsed) {
        this.nativeGridView.trigger('toggle:collapse:all', collapsed);
    }
});
