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
            referenceCell: [{ name: 'Ref 1' }, { name: 'Ref 2' }, { name: 'Ref 3' }, { name: 'Ref 4' }],
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
            dataType: 'String',
            title: 'TextCell',
            required: true,
            sorting: 'asc',
            editable: true,
            autocommit: true
        },
        {
            key: 'numberCell',
            type: 'Number',
            dataType: 'Integer',
            title: 'Number Cell',
            editable: true,
            autocommit: true
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            simplified: true,
            dataType: 'DateTime',
            title: 'DateTime Cell',
            editable: true,
            autocommit: true
        },
        {
            key: 'durationCell',
            type: 'Duration',
            dataType: 'Duration',
            title: 'Duration Cell',
            editable: true,
            autocommit: true
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            dataType: 'Boolean',
            title: 'Boolean Cell',
            editable: true,
            autocommit: true,
            getHidden: model => model.get('numberCell') % 2
        },
        {
            key: 'documentCell',
            type: 'Document',
            dataType: 'Document',
            title: 'Document',
            // editable: true,
            autocommit: true
        },
        {
            key: 'referenceCell',
            type: 'Datalist',
            dataType: 'Instance',
            title: 'Reference Cell',
            simplified: true,
            controller: new core.form.editors.reference.controllers.DemoReferenceEditorController(),
            editable: true,
            autocommit: true,
            getReadonly: model => model.get('numberCell') % 2,
        }
    ];

    const collection = new Backbone.Collection(dataArray);

    // 3. Create grid
    const gridController = new core.list.controllers.GridController({
        columns,
        selectableBehavior: 'multi',
        showToolbar: true,
        showSearch: true,
        showCheckbox: true,
        showRowIndex: true,
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
