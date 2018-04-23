import CanvasView from 'demoPage/views/CanvasView';

export default () => {
    // 1. Get some data
    const dataArray = [];
    for (let i = 0; i < 1000; i++) {
        dataArray.push({
            textCell: `Text Cell ${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell: true,
            userCell: [{ id: 'user.1', columns: ['J. J.'] }],
            referenceCell: { name: 'Ref 1' },
            enumCell: { valueExplained: ['123'] },
            documentCell: [
                {
                    id: `document.${i}`,
                    name: `Document ${i}`,
                    url: `GetDocument/${i}`
                }
            ]
        });
    }

    // 2. Create columns
    const columns = [
        {
            key: 'textCell',
            type: 'Text',
            title: 'TextCell',
            required: true,
            sorting: 'asc',
            editable: true,
            autocommit: true
        },
        {
            key: 'numberCell',
            type: 'Number',
            title: 'Number Cell',
            getReadonly: model => model.get('numberCell') % 2,
            editable: true,
            autocommit: true
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell',
            getHidden: model => model.get('numberCell') % 2,
            editable: true,
            autocommit: true
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell',
            editable: true,
            autocommit: true
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell',
            editable: true,
            autocommit: true
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document',
            editable: true,
            autocommit: true
        },
        {
            key: 'referenceCell',
            type: 'Datalist',
            title: 'Reference Cell',
            controller: new core.form.editors.reference.controllers.DemoReferenceEditorController(),
            editable: true,
            autocommit: true
        }
    ];

    const collection = new Backbone.Collection(dataArray);

    // 3. Create grid
    const gridController = new core.list.controllers.GridController({
        columns,
        selectableBehavior: 'multi',
        showToolbar: true,
        showSearch: true,
        showSelection: true,
        collection,
        title: 'Editable grid'
    });

    const handleAction = (action, items) => {
        switch (action.id) {
            case 'add':
                collection.add({
                    textCell: 'New item'
                });
                break;
            case 'delete':
                collection.remove(items);
                break;
            default:
                break;
        }
    };

    gridController.on('execute', handleAction);

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
};
