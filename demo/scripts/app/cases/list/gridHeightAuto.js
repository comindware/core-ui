define([
    'comindware/core', 'demoPage/views/ListCanvasView'], function (core, ListCanvasView) {
    'use strict';

    return function () {

        // 1. Get some data
        var dataArray = [];
        for (var i = 0; i < 50; i++) {
            dataArray.push({
                textCell: 'Text Cell ' + i,
                numberCell: i + 1,
                dateTimeCell: '2015-07-24T08:13:13.847Z',
                durationCell: 'P12DT5H42M'
            });
        }

        // 2. Create columns
        var columns = [
            {
                id: 'textCell',
                cellView: core.list.cellFactory.getTextCellView(),
                viewModel: new Backbone.Model({displayText: 'TextCell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
                sorting: 'asc'
            },
            {
                id: 'numberCell',
                cellView: core.list.cellFactory.getNumberCellView(),
                viewModel: new Backbone.Model({displayText: 'Number Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Asc, 'numberCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Desc, 'numberCell'),
                sorting: 'asc',
                filterView: core.nativeGrid.filterViewFactory.getFilterViewByType()
            },
            {
                id: 'dateTimeCell',
                cellView: core.list.cellFactory.getDateTimeCellView(),
                viewModel: new Backbone.Model({displayText: 'DateTime Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Asc, 'dateTimeCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Desc, 'dateTimeCell'),
                filterView: core.nativeGrid.filterViewFactory.getFilterViewByType()
            },
            {
                id: 'durationCell',
                cellView: core.list.cellFactory.getDurationCellView(),
                viewModel: new Backbone.Model({displayText: 'Duration Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Asc, 'durationCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Desc, 'durationCell')
            }
        ];

        // 3. Create VirtualCollection
        var collection = new core.collections.VirtualCollection();
        collection.reset(dataArray);

        // 4. Create grid
        var bundle = core.list.factory.createDefaultGrid({
            gridViewOptions: {
                height: 'auto',
                maxRows: 6,
                columns: columns,
                childHeight: 40,
                useDefaultRowView: true
            },
            collection: collection
        });

        // 7. Show created views
        return new ListCanvasView({
            content: bundle.gridView,
            scrollbar: bundle.scrollbarView
        });
    }
});
