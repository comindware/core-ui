import CanvasView from 'demoPage/views/CanvasView';

// 1. Get some data
export default function() {
    const dataArray = [];
    for (let i = 0; i < 50000; i++) {
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
            title: 'TextCell'
        },
        {
            key: 'numberCell',
            type: 'Integer',
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

    // 3. Create grid
    const gridController = new core.list.controllers.GridController({
        columns,
        selectableBehavior: 'multi',
        showSearch: true,
        showSelection: true,
        showToolbar: true,
        collection: new Backbone.Collection(dataArray),
        draggable: true,
        showRowIndex: true
    });

    // 4. Show created views
    return new CanvasView({
        view: gridController.view,
        canvas: {
            height: '250px',
            width: '400px'
        },
        region: {
            float: 'left'
        }
    });
}
