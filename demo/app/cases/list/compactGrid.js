import CanvasView from 'demoPage/views/CanvasView';

// 1. Get some data
export default function () {
    const data = [];
    const childLength = 3;
    const treeHeight = 4;

    const createTree = (parentCollection, level, parent = null) => {
        for (let i = 0; i < childLength; i++) {
            const item = {
                textCell: `Text Cell ${i}`,
                numberCell: i + 1,
                dateTimeCell: '2015-07-24T08:13:13.847Z',
                durationCell: 'P12DT5H42M',
                booleanCell: true,
                userCell: [{ id: 'user.1', columns: ['J. J.'] }],
                referenceCell: { name: 'Ref 1' },
                enumCell: { valueExplained: ['123'] },
                documentCell: [{ id: '1', columns: ['Doc 1', 'url'] }, { id: '2', columns: ['Doc 2', 'url2'] }]
            };
            item.parent = parent;
            if (level > 0) {
                const children = [];
                createTree(children, level - 1, item);
                item.children = children;
            }
            parentCollection.push(item);
        }
    };

    createTree(data, treeHeight);

    // 2. Create columns
    const columns = [
        {
            key: 'textCell',
            type: 'Datalist',
            dataType: 'Instance',
            title: 'TextCell',
            sorting: 'asc',
            editable: true,
            width: 300
        },
        {
            key: 'numberCell',
            type: 'Number',
            title: 'Number Cell',
            editable: true,
            width: 100
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell',
            editable: true,
            width: 100
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell',
            editable: true,
            width: 100
        },
        {
            key: 'booleanCell',
            type: 'Boolean',
            title: 'Boolean Cell',
            editable: true,
            width: 100
        },
        {
            key: 'referenceCell',
            type: 'Datalist',
            title: 'Reference Cell',
            editable: true,
            width: 100
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document Cell',
            editable: true,
            width: 100
        },
        {
            key: 'propertyRule',
            type: 'NewExpression',
            title: 'Expression',
            required: false,
            autocommit: true,
            usePropertyTypes: true,
            showContext: true,
            showValue: true,
            showExpression: true,
            showScript: true,
            allowBlank: true,
            codeEditorMode: 'button',
            displayInline: true,
            editable: true,
            width: 300,
            ontologyService: null,
            id: "pa.7",
            schemaExtension: () => ({
                propertyTypes: [_.uniqueId('type')]
            }),
            context: {
                'oa.1': [
                    {
                        instanceTypeId: 'cmw.instanceProperty',
                        type: 'Instance',
                        format: 'Undefined',
                        name: 'ID',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'id'
                    },
                    {
                        type: 'Account',
                        format: 'Undefined',
                        name: 'Last Modifier',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'lastModifier'
                    },
                    {
                        type: 'DateTime',
                        format: 'Undefined',
                        name: 'Last Modified',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'lastWriteDate'
                    },
                    {
                        instanceTypeId: 'oa.1',
                        type: 'Collection',
                        format: 'Undefined',
                        name: 'coll',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'op.2'
                    },
                    {
                        instanceTypeId: 'oa.1',
                        type: 'Instance',
                        format: 'Undefined',
                        name: 'refToCol',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'op.1'
                    },
                    {
                        type: 'DateTime',
                        format: 'Undefined',
                        name: 'Creation Date',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'creationDate'
                    },
                    {
                        type: 'Boolean',
                        format: 'Undefined',
                        name: 'In archive',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'isDisabled'
                    },
                    {
                        type: 'Account',
                        format: 'Undefined',
                        name: 'Creator',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'creator'
                    },
                    {
                        type: 'String',
                        format: 'Undefined',
                        name: 'werterwtert',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'op.10'
                    },
                    {
                        instanceTypeId: 'oa.1',
                        type: 'Instance',
                        format: 'Undefined',
                        name: 'sdfsf',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'op.13'
                    },
                    {
                        instanceTypeId: 'oa.1',
                        type: 'Collection',
                        format: 'Undefined',
                        name: 'coll',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'op.14'
                    },
                    {
                        type: 'String',
                        format: 'Undefined',
                        name: 'Process ID',
                        displayAttribute: false,
                        isBuiltIn: true,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'engine:id'
                    },
                    {
                        type: 'String',
                        format: 'Undefined',
                        name: 'Record ID',
                        displayAttribute: false,
                        isBuiltIn: true,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'id'
                    },
                    {
                        type: 'Account',
                        format: 'Undefined',
                        name: 'Process Initiator',
                        displayAttribute: false,
                        isBuiltIn: true,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'creator'
                    }
                ]
            },
            recordTypeId: 'oa.1',
            schemaExtension: () => ({
                propertyTypes: ['Text']
            })
        }
    ];

    // 3. Create grid
    const nativeGridView = Core.list.factory.createDefaultGrid({
        gridViewOptions: {
            columns,
            selectableBehavior: 'multi',
            isTree: true,
            draggable: true,
            showToolbar: true,
            showSearch: true,
            showCheckbox: true,
            showRowIndex: true,
            childrenAttribute: 'children',
            class: 'compact'
        },
        collection: data
    });

    // 4. Show created views
    return new CanvasView({
        view: nativeGridView,
        canvas: {
            height: '250px',
            width: '400px'
        },
        region: {
            float: 'left'
        }
    });
}
