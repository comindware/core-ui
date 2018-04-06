
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

// 1. Get some data
export default function() {
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
            viewModel: new Backbone.Model({ displayText: 'TextCell' })
        },
        {
            id: 'numberCell',
            type: 'Integer',
            viewModel: new Backbone.Model({ displayText: 'Number Cell' })
        },
        {
            id: 'dateTimeCell',
            type: 'DateTime',
            viewModel: new Backbone.Model({ displayText: 'DateTime Cell' })

        },
        {
            id: 'durationCell',
            type: 'Duration',
        },
        {
            id: 'booleanCell',
            type: 'Boolean',
            viewModel: new Backbone.Model({ displayText: 'Boolean Cell' })
        },
        {
            id: 'referenceCell',
            type: 'Instance',
            viewModel: new Backbone.Model({ displayText: 'Reference Cell' })
        },
        {
            id: 'documentCell',
            type: 'Document',
            viewModel: new Backbone.Model({ displayText: 'Document Cell' })
        }
    ];

    // 3. Create grid
    const gridController = new core.list.controllers.GridController({
        columns,
        selectableBehavior: 'multi',
        showSearch: true,
        showSelection: true,
        collection: new Backbone.Collection(dataArray)
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
