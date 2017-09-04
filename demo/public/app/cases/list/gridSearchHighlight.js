import core from 'comindware/core';
import ListSearchCanvasView from 'demoPage/views/ListSearchCanvasView';

// 1. Get some data
const dataArray = [
    {
        firstName: 'Airi',
        secondName: 'Satou',
        city: 'Tokyo',
        age: '33'
    },
    {
        firstName: 'Angelica',
        secondName: 'Ramos',
        city: 'London',
        age: '54'
    },
    {
        firstName: 'Gloria',
        secondName: 'Little',
        city: 'Edinburgh',
        age: '23'
    },
    {
        firstName: 'Sonya',
        secondName: 'Frost',
        city: 'Singapore',
        age: '36'
    },
    {
        firstName: 'Tatyana',
        secondName: 'Fitzpatrick',
        city: 'San Francisco',
        age: '32'
    }
];

// 2. Create columns
const columns = [
    {
        id: 'firstName',
        cellView: core.list.cellFactory.getTextCellView(),
        viewModel: new Backbone.Model({ displayText: 'First Name' }),
        sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
        sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
        sorting: 'asc'
    },
    {
        id: 'secondName',
        cellView: core.list.cellFactory.getTextCellView(),
        viewModel: new Backbone.Model({ displayText: 'Second Name' }),
        sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
        sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
        sorting: 'asc'
    },
    {
        id: 'city',
        cellView: core.list.cellFactory.getTextCellView(),
        viewModel: new Backbone.Model({ displayText: 'City' }),
        sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
        sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
        sorting: 'asc'
    },
    {
        id: 'age',
        cellView: core.list.cellFactory.getTextCellView(),
        viewModel: new Backbone.Model({ displayText: 'Age' }),
        sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
        sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
        sorting: 'asc'
    }
];

// 3. Create Backbone.Model that implement ListItemBehavior
const GridItemModel = Backbone.Model.extend({
    initialize() {
        core.utils.helpers.applyBehavior(this, core.list.models.behaviors.ListItemBehavior);
    }
});

// 4. Create VirtualCollection that use this model (and do other stuff maybe)
//    apply HighlightableBehavior on it
const GridItemCollection = core.collections.VirtualCollection.extend({
    initialize() {
        core.utils.helpers.applyBehavior(this, core.collections.behaviors.HighlightableBehavior);
    },
    model: GridItemModel
});

const collection = new GridItemCollection(/*dataArray*/);
collection.reset(dataArray);

// 5. Create grid
const bundle = core.list.factory.createDefaultGrid({
    gridViewOptions: {
        columns,
        childHeight: 40,
        useDefaultRowView: true
    },
    collection
});

// 6. Create searchbar view (or whatever you want to change filter function) and implement search
const searchBarView = new core.views.SearchBarView();
searchBarView.on('search', text => {
    if (!text) {
        collection.filter(null);
        collection.unhighlight();
    } else {
        text = text.toLowerCase();
        collection.unhighlight();
        collection.filter(model => _.find(model.attributes, it => it.toLowerCase().indexOf(text) !== -1));
        collection.highlight(text);
    }
});

// 7. Show created views in corresponding regions
export default new ListSearchCanvasView({
    search: searchBarView,
    content: bundle.gridView,
    scrollbar: bundle.scrollbarView
});
