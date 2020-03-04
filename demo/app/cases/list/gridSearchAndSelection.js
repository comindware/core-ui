import CanvasView from 'demoPage/views/CanvasView';

// 1. Get some data
export default function() {
    const dataArray = [];
    for (let i = 0; i < 1000; i++) {
        dataArray.push({
            textCell: `Text Cell ${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell: true,
            userCell:
                i > 4
                    ? [{ id: 'user.1', name: 'Nicola Tesla', avatarUrl: 'images/image2.jpg' }]
                    : [{ id: 'user.1', name: 'Nicola Tesla', avatarUrl: 'images/image2.jpg' }, { id: 'user.2', name: 'Thomas Edison' }],
            referenceCell: i > 4 ? [{ id: '1', name: 'Ref 1', url: 'url2' }] : [{ id: '1', name: 'Ref 1' }, { id: '2', name: 'Ref 2', url: 'url2' }],
            documentCell: i > 4 ? [{ id: '1', name: 'Doc 1', url: 'url1' }] : [{ id: '1', name: 'Doc1.jpg', url: 'url1' }, { id: '2', name: 'Doc 2', url: 'url2' }],
            enumCell: { valueExplained: ['123'] },
            textCell1: [`Text Cell ${i}`, `Text Cell ${i + 1}`],
            numberCell1: [i + 1, i + 2],
            dateTimeCell1: ['2015-07-24T08:13:13.847Z', '2016-07-24T08:13:13.847Z'],
            durationCell1: ['P12DT5H42M', 'P22DT5H42M'],
            booleanCell1: [true, false],
            userCell1:
                i > 400
                    ? [{ id: 'user.1', name: 'Nicola Tesla', avatarUrl: 'images/image2.jpg' }]
                    : [{ id: 'user.1', name: 'Nicola Tesla', avatarUrl: 'images/image2.jpg' }, { id: 'user.2', name: 'Thomas Edison' }],
            referenceCell1: i > 400 ? [{ id: '1', name: 'Ref 1', url: 'url2' }] : [{ id: '1', name: 'Ref 1' }, { id: '2', name: 'Ref 2', url: 'url2' }],
            documentCell1: i > 400 ? [{ id: '1', name: 'Doc 1', url: 'url1' }] : [{ id: '1', name: 'Doc1.jpg', url: 'url1' }, { id: '2', name: 'Doc 2', url: 'url2' }],
            enumCell: { valueExplained: ['123'] }
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
            key: 'userCell',
            type: 'Account',
            title: 'User'
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
        },
        {
            key: 'textCell1',
            type: 'String',
            title: 'TextCell'
        },
        {
            key: 'numberCell1',
            type: 'Integer',
            title: 'Number Cell'
        },
        {
            key: 'dateTimeCell1',
            type: 'DateTime',
            title: 'DateTime Cell'
        },
        {
            key: 'durationCell1',
            type: 'Duration',
            title: 'Duration Cell'
        },
        {
            key: 'userCell1',
            type: 'Account',
            title: 'User'
        },
        {
            key: 'booleanCell1',
            type: 'Boolean',
            title: 'Boolean Cell'
        },
        {
            key: 'referenceCell1',
            type: 'Instance',
            title: 'Reference Cell'
        },
        {
            key: 'documentCell1',
            type: 'Document',
            title: 'Document Cell'
        }
    ];

    // 3. Create grid
    const gridView = new Core.list.GridView({
        title: 'Beautiful Grid',
        columns,
        selectableBehavior: 'multi',
        // disableMultiSelection: true, //another case of API
        showSearch: true,
        showCheckbox: true,
        showToolbar: true,
        collection: new Backbone.Collection(dataArray),
        draggable: true,
        // isSliding: false,
        showRowIndex: true,
        // showTreeEditor: true,
        // treeEditorConfig: new Map([
        //     ['dateTimeCell', { index: 3 }],
        //     ['durationCell', { index: 4, isHidden: true }],
        //     ['numberCell', { index: 2 }],
        //     ['textCell', { index: 1, isHidden: true }],
        //     ['userCell', { index: 0, isHidden: true }]
        // ]),
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
                items: [
                    {
                        class: 'customclass',
                        userCommandId: 'event.176',
                        name: 'Delete',
                        order: 0,
                        type: 'Action',
                        iconType: 'Undefined',
                        iconClass: 'braille',
                        severity: 'None',
                        skipValidation: false,
                        kind: 'Delete',
                        resultType: 'DataChange',
                        confirmation: {
                            id: 'confirmation.27',
                            title: 'New operation',
                            text: 'Confirm operation',
                            yesButtonText: 'Execute',
                            noButtonText: 'Cancel',
                            severity: 'None'
                        }
                    },
                    {
                        userCommandId: 'event.1',
                        name: 'Create',
                        order: 1,
                        type: 'Action',
                        iconType: 'Undefined',
                        iconClass: 'wheelchair',
                        severity: 'None',
                        skipValidation: false,
                        kind: 'Create',
                        resultType: 'DataChange'
                    },
                    {
                        userCommandId: 'event.176',
                        name: 'Delete',
                        order: 2,
                        type: 'Action',
                        iconType: 'Undefined',
                        severity: 'None',
                        skipValidation: false,
                        kind: 'Delete',
                        resultType: 'DataChange',
                        confirmation: {
                            id: 'confirmation.27',
                            title: 'New operation',
                            text: 'Confirm operation',
                            yesButtonText: 'Execute',
                            noButtonText: 'Cancel',
                            severity: 'None'
                        }
                    },
                    {
                        userCommandId: 'event.176',
                        name: 'Delete',
                        order: 3,
                        type: 'Action',
                        iconType: 'Undefined',
                        severity: 'None',
                        skipValidation: false,
                        kind: 'Delete',
                        resultType: 'DataChange',
                        confirmation: {
                            id: 'confirmation.27',
                            title: 'New operation',
                            text: 'Confirm operation',
                            yesButtonText: 'Execute',
                            noButtonText: 'Cancel',
                            severity: 'None'
                        }
                    }
                ]
            }
        ]
    });

    // 4. Show created views
    const canvasView = new CanvasView({
        view: gridView,
        canvas: {
            height: '250px',
            width: '400px'
        },
        region: {
            float: 'left'
        }
    });

    canvasView.__counter = 0;
    canvasView.__executeAction = function(model, selected) {
        switch (model.get('id')) {
            case 'add':
                this.options.view.collection.add({
                    textCell: `Some new ${this.__counter}`,
                    numberCell: this.__counter + 1,
                    dateTimeCell: '2015-07-24T08:13:13.847Z',
                    durationCell: 'P12DT5H42M',
                    booleanCell: !!(this.__counter % 2),
                    userCell: [{ id: 'user.1', columns: ['J. J.'] }],
                    referenceCell: { name: 'Ref 1' },
                    enumCell: { valueExplained: ['123'] },
                    documentCell: [{ id: '1', columns: ['Doc 1', 'url'] }, { id: '2', columns: ['Doc 2', 'url2'] }]
                });
                this.__counter++;
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
        }
    };

    canvasView.listenTo(gridView, 'execute', canvasView.__executeAction);
    canvasView.listenTo(gridView, 'treeEditor:save', config => console.log(config));

    return canvasView;
}
