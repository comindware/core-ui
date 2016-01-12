define([
    'comindware/core', 'demoPage/views/ListSearchCanvasView'], function (core, ListSearchCanvasView) {
    'use strict';

    return function () {

        // 1. Get some data
        var dataArray = [
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
        var columns = [
            {
                id: 'firstName',
                cellView: core.list.cellFactory.getTextCellView(),
                viewModel: new Backbone.Model({displayText: 'First Name'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
                sorting: 'asc'
            },
            {
                id: 'secondName',
                cellView: core.list.cellFactory.getTextCellView(),
                viewModel: new Backbone.Model({displayText: 'Second Name'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
                sorting: 'asc'
            },
            {
                id: 'city',
                cellView: core.list.cellFactory.getTextCellView(),
                viewModel: new Backbone.Model({displayText: 'City'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
                sorting: 'asc'
            },
            {
                id: 'age',
                cellView: core.list.cellFactory.getTextCellView(),
                viewModel: new Backbone.Model({displayText: 'Age'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
                sorting: 'asc'
            }
        ];

        // 3. Create Backbone.Model that implement ListItemBehavior
        var GridItemModel = Backbone.Model.extend({
            initialize: function () {
                core.utils.helpers.applyBehavior(this, core.list.models.behaviors.ListItemBehavior);
            }
        });

        // 4. Create VirtualCollection that use this model (and do other stuff maybe)
        //    apply HighlightableBehavior on it
        var GridItemCollection = core.collections.VirtualCollection.extend({
            initialize: function () {
                core.utils.helpers.applyBehavior(this, core.collections.behaviors.HighlightableBehavior);
            },
            model: GridItemModel
        });

        var collection = new GridItemCollection(/*dataArray*/);
        collection.reset(dataArray);

        // 5. Create grid
        var bundle = core.list.factory.createDefaultGrid({
            gridViewOptions: {
                columns: columns,
                childHeight: 40,
                useDefaultRowView: true
            },
            collection: collection
        });

        // 6. Create searchbar view (or whatever you want to change filter function) and implement search
        var searchBarView = new core.views.SearchBarView();
        searchBarView.on('search', function (text) {
            if (!text) {
                collection.filter(null);
                collection.unhighlight();
            } else {
                text = text.toLowerCase();
                collection.unhighlight();
                collection.filter(function (model) {
                    return _.find(model.attributes, function (it) { return it.toLowerCase().indexOf(text) !== -1; });
                });
                collection.highlight(text);
            }
        });

        // 7. Show created views in corresponding regions
        return new ListSearchCanvasView({
            search: searchBarView,
            content: bundle.gridView,
            scrollbar: bundle.scrollbarView
        });
    }
});
