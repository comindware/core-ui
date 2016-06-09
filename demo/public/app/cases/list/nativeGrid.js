define(['comindware/core', 'demoPage/views/CanvasView' ], function (core, CanvasView) {
    'use strict';

    return function () {

        // 1. Get some data
        var dataArray = [];
        for (var i = 0; i < 50; i++) {
            dataArray.push({
                textCell: 'Text Cell ' + i,
                numberCell: i + 1,
                dateTimeCell: '2015-07-24T08:13:13.847Z',
                durationCell: 'P12DT5H42M',
                booleanCell: true,
                userCell: [{id: 'account.1', columns: ['J. J.']}],
                referenceCell: {name: 'Ref 1'},
                enumCell: {valueExplained: ['123']},
                documentCell: [{id: '1', columns: ['Doc 1', 'url']}, {id: '2', columns: ['Doc 2', 'url2']}]
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
                sorting: 'asc'
            },
            {
                id: 'dateTimeCell',
                cellView: core.list.cellFactory.getDateTimeCellView(),
                viewModel: new Backbone.Model({displayText: 'DateTime Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Asc, 'dateTimeCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Desc, 'dateTimeCell')
            },
            {
                id: 'durationCell',
                cellView: core.list.cellFactory.getDurationCellView(),
                viewModel: new Backbone.Model({displayText: 'Duration Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Asc, 'durationCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Desc, 'durationCell')
            },
            {
                id: 'booleanCell',
                cellView: core.list.cellFactory.getBooleanCellView(),
                viewModel: new Backbone.Model({displayText: 'Boolean Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'booleanCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'booleanCell')
            },
            {
                id: 'referenceCell',
                cellView: core.list.cellFactory.getReferenceCellView(),
                viewModel: new Backbone.Model({displayText: 'Reference Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Asc, 'referenceCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Desc, 'referenceCell')
            },
            {
                id: 'enumCell',
                cellView: core.list.cellFactory.getEnumCellView(),
                viewModel: new Backbone.Model({displayText: 'Enum Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'enumCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'enumCell')
            },
            {
                id: 'documentCell',
                cellView: core.list.cellFactory.getDocumentCellView(),
                viewModel: new Backbone.Model({displayText: 'Document Cell'}),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Asc, 'documentCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Desc, 'documentCell')
            }
        ];

        // 3. Create grid
        var nativeGridView = core.nativeGrid.factory.createNativeGrid({
            gridViewOptions: {
                columns: columns,
                selectableBehavior: 'multi'
            },
            collection: new Backbone.Collection(dataArray)
        });

        // 4. Show created views
        return new CanvasView({
            view: nativeGridView,
            canvas: {
                height: '250px'
            },
            region: {
                float: 'left'
            }
        });
    };
});
