/**
 * Created by sguryev on 13.07.2017.
 */
import utils from 'utils';
import factory from '../../nativeGrid/factory';
import template from '../templates/editableGrid.hbs';
import EditableGridHeaderToolbarView from '../views/EditableGridHeaderToolbarView';
import EditableGridHeaderView from '../views/EditableGridHeaderView';
import SelectionView from '../views/SelectionView';
import EditableGridCellViewFactory from '../services/EditableGridCellViewFactory';
import SelectableCollection from '../collections/SelectableCollection';

const constants = {
    rowHeight: 25,
    defaultCollHeight: 44,
    defaultCheckBoxColumnWidth: 30
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        this.collection = options.collection;
        if (options.showSelectColumn !== false) {
            this.selectableCollection = new SelectableCollection(this.collection.map(model => ({ id: model.cid })));
            this.collectionHeaderToolbarView = this.__createCollectionHeaderToolbarView();
            this.listenTo(this.collectionHeaderToolbarView, 'toolbar:execute:action', this.__executeAction);
            this.listenTo(this.collection, 'add remove reset', this.__setGridHeight);
            this.listenTo(this.collection, 'add', model => {
                this.selectableCollection.add({ id: model.cid });
                if (this.selectableCollection.selectedLength) {
                    this.selectableCollection.trigger('select:some');
                }
            });
            this.listenTo(this.collection, 'remove', model => {
                const modelToRemove = this.selectableCollection.get(model.cid);
                modelToRemove.deselect();
                this.selectableCollection.remove(this.selectableCollection.get(modelToRemove));
            });
            this.listenTo(this.collection, 'reset', () => {
                this.selectableCollection.trigger('select:none');
                this.selectableCollection.reset(this.collection.map(model => ({ id: model.cid })));
            });
            this.listenTo(this.selectableCollection, 'select:all select:some select:none', this.__selectionChange);
        }
    },

    ui: {
        collectionName: '.js-collection-name',
        grid: '.js-grid-region'
    },

    regions: {
        gridRegion: '.js-grid-region',
        collectionHeaderToolbarRegion: '.js-collection-header-toolbar-region'
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
    },

    __onCollectionChange() {
        this.selectableCollection.trigger('select:none');
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
        const heightPx = this.collection.length ? ((this.collection.length * constants.rowHeight) + constants.defaultCollHeight) : 0;
        this.ui.grid.css('height', heightPx);
    },

    __showGridView() {
        const columns = this.__getColumns();
        columns.unshift({
            id: 'selected',
            cellView: SelectionView,
            viewModel: new Backbone.Model({
                displayText: '',
                selectableCollection: this.selectableCollection,
                isCheckboxColumn: true,
            }),
            width: constants.defaultCheckBoxColumnWidth
        });

        const nativeGridView = factory.createNativeGrid({
            gridViewOptions: {
                columns,
                selectableBehavior: 'multi',
                childHeight: this.options.rowHeight,
                paddingRight: 1,
                paddingLeft: 1
            },
            headerView: EditableGridHeaderView,
            collection: this.collection
        });
        this.listenTo(nativeGridView, 'item:show', this.__showRecord);
        this.listenTo(nativeGridView, 'selection:change', this.__selectionChange);
        this.gridRegion.show(nativeGridView);
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
        const result = [];
        this.selectableCollection.each(model => {
            if (model.selected) {
                result.push(this.collection.get(model.id));
            }
        });
        return result;
    }
});
