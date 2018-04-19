

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
            key: 'textCell',
            type: 'String',
            title: 'Text Cell',
            sorting: 'desc'
        },
        {
            key: 'numberCell',
            type: 'Double',
            title: 'Number Cell'
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell'
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell'
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell'
        },
        {
            key: 'referenceCell',
            type: 'Instance',
            title: 'Reference Cell'
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document Cell'
        }
    ];

    // 3. Create VirtualCollection
    const collection = new core.collections.VirtualCollection();
    collection.reset(dataArray);

    // 4. Create grid
    const gridView = core.list.factory.createDefaultGrid({
        gridViewOptions: {
            columns,
            childHeight: 40,
            useDefaultRowView: true
        },
        collection
    });

    // 7. Show created views
    return new ListCanvasView({
        content: gridView
    });
}
