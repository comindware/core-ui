

import ListCanvasView from 'demoPage/views/ListCanvasView';

export default function() {
    // 1. Get some data
    const dataArray = [];
    // for (let i = 0; i < 1000; i++) {
    //     dataArray.push({
    //         textCell: `Text Cell ${i}`,
    //         numberCell: i + 1,
    //         dateTimeCell: '2015-07-24T08:13:13.847Z',
    //         durationCell: 'P12DT5H42M',
    //         booleanCell: true,
    //         userCell: [{ id: 'user.1', columns: ['J. J.'] }],
    //         referenceCell: { name: 'Ref 1' },
    //         enumCell: { valueExplained: ['123'] },
    //         documentCell: [{ id: '1', columns: ['Doc 1', 'url'] }, { id: '2', columns: ['Doc 2', 'url2'] }]
    //     });
    // }

    // 2. Create columns
    const columns = [
        {
            key: 'textCell',
            type: 'String',
            title: 'Hidden Column',
            sorting: 'desc',
            isHidden: true
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
        // {
        //     key: 'durationCell',
        //     type: 'Duration',
        //     title: 'Duration Cell'
        // },
        // {
        //     key: 'booleanCell',
        //     type: 'Boolean',
        //     title: 'Boolean Cell'
        // },
        // {
        //     key: 'referenceCell',
        //     type: Core.meta.objectPropertyTypes.INSTANCE,
        //     title: 'Reference Cell'
        // },
        // {
        //     key: 'documentCell',
        //     type: Core.meta.objectPropertyTypes.DOCUMENT,
        //     title: 'Document Cell'
        // }
    ];

    const collection = new Backbone.Collection();
    // 4. Create grid
    const gridView = Core.list.factory.createDefaultGrid({
        gridViewOptions: {
            columns,
            showToolbar: true,
            childHeight: 35,
            useDefaultRowView: true,
            minimumVisibleRows: 100
        },
        collection
    });

    gridView.on('execute', () => collection.add({}));

    // 7. Show created views
    return new ListCanvasView({
        content: gridView
    });
}
