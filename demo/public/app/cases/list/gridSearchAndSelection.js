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
    const gridController = new Core.list.controllers.GridController({
        columns,
        selectableBehavior: 'multi',
        // disableMultiSelection: true, //another case of API
        showSearch: true,
        showCheckbox: true,
        showToolbar: true,
        collection: new Backbone.Collection(dataArray),
        draggable: true,
        showRowIndex: true,
        excludeActions: ['delete'],
        additionalActions: [
            {
                id: 'showArchived',
                name: 'showArchived',
                type: 'Checkbox',
                isChecked: true,
                severity: 'Critical',
                class: 'customizeClass'
            },
            {
                name: 'Группа',
                order: 5,
                type: 'Group',
                iconType: 'Undefined',
                iconClass: 'low-vision',
                severity: 'None',
                class: 'customclass',
                items:[{ class: 'customclass', userCommandId:'event.176', name: 'Delete', order: 0, type: 'Action', iconType: 'Undefined', iconClass: 'braille', severity: 'None', skipValidation: false, kind: 'Delete', resultType: 'DataChange', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } },
                { userCommandId: 'event.1', name: 'Create', order: 1, type: 'Action', iconType: 'Undefined', iconClass: 'wheelchair', severity: 'None', skipValidation: false, kind: 'Create', resultType: 'DataChange' },
                { userCommandId: 'event.176', name: 'Delete', order: 2, type: 'Action', iconType: 'Undefined', severity: 'None', skipValidation: false, kind: 'Delete', resultType: 'DataChange', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } },
                { userCommandId: 'event.176', name: 'Delete', order: 3, type: 'Action', iconType: 'Undefined', severity: 'None', skipValidation: false, kind: 'Delete', resultType: 'DataChange', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } }]
            }
        ]
    });

    // 4. Show created views
    const canvasView = new CanvasView({
        view: gridController.view,
        canvas: {
            height: '250px',
            width: '400px'
        },
        region: {
            float: 'left'
        }
    });

    canvasView.__executeAction = (model, selected) => {
        switch (model.get('id')) {
            case 'add':
                //some code here
                break;
            case 'archive':
                //some code here
                break;
            case 'unarchive':
                //some code here
                break;
            case 'showArchived':
                console.log(model.get('isChecked'));
                break;
            default:
                break;
        };
    }

    canvasView.listenTo(gridController, 'execute', canvasView.__executeAction);

    return canvasView;
}
