import CanvasView from 'demoPage/views/CanvasView';

export default () => {
    // 1. Get some data
    const dataArray = [];
    for (let i = 0; i < 100; i++) {
        dataArray.push({
            textCell: `Текст Яч. ${i}`,
            aliasCell: `Alias_Cell_${i}`,
            numberCell: i + 1,
            dateTimeCell: '2015-07-24T08:13:13.847Z',
            durationCell: 'P12DT5H42M',
            booleanCell: i % 2 === 0,
            referenceCell: [
                { id: 'task.1', name: 'Ref 1', abbreviation: 'AB' },
                { id: 'task.2', name: 'Ref 2' },
                { id: 'task.3', name: 'Ref 3' },
                { id: 'task.4', name: 'Ref 4' },
                { id: 'task.5', name: 'Ref 5' },
                { id: 'task.6', name: 'Ref 6' },
                { id: 'task.7', name: 'Ref 7' }
            ],
            userCell: [
                { id: 'user.1', name: 'User 1' },
                { id: 'user.2', name: 'User 1' }
            ],
            enumCell: { valueExplained: ['123'] },
            documentCell: [
                {
                    id: `document.${i}`,
                    name: `Document ${i}`,
                    url: `GetDocument/${i}`
                },
                {
                    id: `document.${i + 1}`,
                    name: `Document ${i + 1}`,
                    url: `GetDocument/${i + 1}`
                }
            ]
        });
    }

    const generateCollection = (count, prefix) => {
        const result = [];
        const capitalizedPrefix = prefix.replace(/^./, ch => ch.toUpperCase());
        for (let i = 0; i < count; i++) {
            result.push({
                id: `${prefix}.${i}`,
                name: `${capitalizedPrefix} ${i}`
            });
        }
        return result;
    };

    const referenceCollection = generateCollection(20, 'task');
    const userCollection = generateCollection(20, 'user');

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
            helpText: 'Text cell'
            // autocommit: true //property autocommit:true will be set for transliteratedFields
        },
        {
            key: 'textCell',
            type: 'TextArea',
            dataType: 'String',
            title: 'TextCell',
            required: true,
            sorting: 'asc',
            editable: true,
            helpText: 'Text cell'
            // autocommit: true //property autocommit:true will be set for transliteratedFields
        },
        {
            key: 'textCell',
            type: 'Text',
            dataType: 'String',
            title: 'TextCell',
            required: true,
            sorting: 'asc',
            editable: true,
            helpText: 'Text cell'
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
            getReadonly: model => model.get('booleanCell')
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
            dataType: 'DateTime',
            title: 'DateTime Cell',
            width: 0.2,
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
            getHidden: model => model.get('numberCell') % 5 === 0,
            getReadonly: model => model.get('numberCell') % 7 === 0,
        },
        {
            key: 'documentCell',
            type: 'Datalist',
            dataType: 'Document',
            format: 'document',
            title: 'Document',
            editable: true,
            autocommit: true
        },
        {
            key: 'referenceCell',
            type: 'Datalist',
            dataType: 'Instance',
            title: 'Reference Cell',
            required: true,
            customClass: 'dropdown_root',
            controller: new Core.form.editors.reference.controllers.DemoReferenceEditorController({
                collection: referenceCollection
            }),
            editable: true,
            showCheckboxes: true,
            autocommit: true,
            maxQuantitySelected: 5,
            simplified: true,
            getReadonly: model => model.get('numberCell') % 2,
            collection: referenceCollection
        },
        {
            key: 'userCell',
            type: 'Datalist',
            dataType: 'Account',
            title: 'User Cell',
            required: true,
            customClass: 'dropdown_root',
            controller: new Core.form.editors.reference.controllers.DemoReferenceEditorController({
                collection: userCollection
            }),
            format: 'user',
            editable: true,
            autocommit: true,
            showCheckboxes: true,
            maxQuantitySelected: 5,
            collection: userCollection,
            getReadonly: model => model.get('numberCell') % 2,
            getHidden: model => model.get('numberCell') % 3
        }
    ];

    const collection = new Backbone.Collection(dataArray);

    // 3. Create grid
    const gridController = new Core.list.GridView({
        columns,
        transliteratedFields: {
            textCell: 'aliasCell'
        },
        selectableBehavior: 'multi',
        showToolbar: true,
        showSearch: true,
        showCheckbox: true,
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
        view: gridController,
        canvas: {
            height: '250px',
            width: '400px'
        },
        region: {
            float: 'left'
        }
    });
};
