
import core from 'comindware/core';
import ListCanvasView from 'demoPage/views/ListCanvasView';

export default function() {
    // 1. Get some data
    const dataArray = [];
    for (let i = 0; i < 50; i++) {
        dataArray.push({
            textCell: `Text Cell ${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell: true,
            userCell: [{ id: 'user.1', columns: ['J. J.'] }],
            referenceCell: { name: 'Ref 1' },
            enumCell: { valueExplained: ['123'] },
            documentCell: [{ id: '1', columns: ['Doc 1', 'url'] }, { id: '2', columns: ['Doc 2', 'url2'] }]
        });
    }

    // 2. Create columns
    const columns = [
        {
            id: 'textCell',
            type: 'String',
            viewModel: new Backbone.Model({ displayText: 'TextCell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
            sorting: 'asc'
        },
        {
            id: 'numberCell',
            type: 'Double',
            viewModel: new Backbone.Model({ displayText: 'Number Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Asc, 'numberCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Desc, 'numberCell'),
            sorting: 'asc',
        },
        {
            id: 'dateTimeCell',
            type: 'DateTime',
            viewModel: new Backbone.Model({ displayText: 'DateTime Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Asc, 'dateTimeCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.dateComparator2Desc, 'dateTimeCell')
        },
        {
            id: 'durationCell',
            type: 'Duration',
            viewModel: new Backbone.Model({ displayText: 'Duration Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Asc, 'durationCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.durationComparator2Desc, 'durationCell')
        },
        {
            id: 'booleanCell',
            type: 'Boolean',
            viewModel: new Backbone.Model({ displayText: 'Boolean Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Asc, 'booleanCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.booleanComparator2Desc, 'booleanCell')
        },
        {
            id: 'referenceCell',
            type: 'Instance',
            viewModel: new Backbone.Model({ displayText: 'Reference Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Asc, 'referenceCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Desc, 'referenceCell')
        },
        {
            id: 'documentCell',
            type: 'Document',
            viewModel: new Backbone.Model({ displayText: 'Document Cell' }),
            sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Asc, 'documentCell'),
            sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.referenceComparator2Desc, 'documentCell')
        }
    ];

    // 3. Create VirtualCollection
    const collection = new core.collections.VirtualCollection();
    collection.reset(dataArray);

    // 4. Create grid
    const bundle = core.list.factory.createDefaultGrid({
        gridViewOptions: {
            columns,
            childHeight: 40,
            useDefaultRowView: true
        },
        collection
    });

    // 7. Show created views
    return new ListCanvasView({
        content: bundle.gridView
    });
}
