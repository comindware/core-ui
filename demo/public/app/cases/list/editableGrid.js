import CanvasView from 'demoPage/views/CanvasView';

export default () => {
    // 1. Get some data
    const dataArray = [];
    for (let i = 0; i < 15; i++) {
        dataArray.push({
            textCell: `Текст Яч. ${i}`,
            aliasCell: `Alias_Cell_${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell: true,
            userCell: [{ id: 'user.1', columns: ['J. J.'] }],
            referenceCell: [{ id: 'task.1', name: 'Ref 1', abbreviation: 'AB' }, { id: 'task.2', name: 'Ref 2' }, { id: 'task.3', name: 'Ref 3' }, { id: 'task.4', name: 'Ref 4' }, { id: 'task.5', name: 'Ref 5' }, { id: 'task.6', name: 'Ref 6' }, { id: 'task.7', name: 'Ref 7' }],
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
            // autocommit: true //property autocommit:true will be set for transliteratedFields
        },
        {
            key: 'aliasCell',
            type: 'Text',
            dataType: 'String',
            title: 'AliasCell',
            required: true,
            sorting: 'asc',
            editable: true,
            // autocommit: true //property autocommit:true will be set for transliteratedFields
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
            simplified: true,
            editable: true,
            autocommit: true
        },
        {
            key: 'referenceCell',
            type: 'Datalist',
            dataType: 'Instance',
            title: 'Reference Cell',
            simplified: true,
            required: true,
            customClass: 'dropdown_root',
            controller: new core.form.editors.reference.controllers.DemoReferenceEditorController(),
            editable: true,
            showCheckboxes: true,
            autocommit: true,
            maxQuantitySelected: 5,
            getReadonly: model => model.get('numberCell') % 2,
        }
    ];

    const collection = new Backbone.Collection(dataArray);

    // 3. Create grid
    const gridController = new core.list.controllers.GridController({
        columns,
        transliteratedFields: {
            textCell: 'aliasCell'
        },
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
