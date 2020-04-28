import CanvasView from 'demoPage/views/CanvasView';

// 1. Get some data
export default function() {
    const data = [];
    const childLength = 16;
    const treeHeight = 2;

    const getValueEditorByIndex = i => {
        switch (i % (childLength / 2)) {
            case 1:
                return 'Text';
            case 2:
                return 'Number';
            case 3:
                return 'DateTime';
            case 4:
                return 'Duration';
            case 5:
                return 'Datalist';
            case 6:
                return 'Datalist';
            case 7:
                return 'Boolean';
            case 0:
                return 'Datalist';
            default:
                return 'Text';
        }
    };

    const getPropertyTypeByIndex = i => {
        switch (i % (childLength / 2)) {
            case 1:
                return 'Text';
            case 2:
                return 'Number';
            case 3:
                return 'DateTime';
            case 4:
                return 'Duration';
            case 5:
                return 'Reference';
            case 6:
                return 'Document';
            case 7:
                return 'Boolean';
            case 0:
                return 'User';
            default:
                return 'Text';
        }
    };

    const createTree = (parentCollection, level, parent = null) => {
        for (let i = 0; i < childLength; i++) {
            const item = {
                index: i,
                textCell: `Text Cell ${i}`,
                numberCell: i + 1,
                dateTimeCell: '2015-07-24T08:13:13.847Z',
                durationCell: 'P12DT5H42M',
                booleanCell: true,
                userCell: [{ id: 'user.1', name: 'someUser' }],
                referenceCell: { name: 'Ref 1' },
                enumCell: { valueExplained: ['123'] },
                documentCell: [{ id: '1', name: 'Doc 1', columns: ['Doc 1', 'url'] }, { id: '2', name: 'Doc 2', columns: ['Doc 2', 'url2'] }]
            };
            let propertyRule;
            switch (i % childLength) {
                case 1:
                    propertyRule = {
                        type: 'value',
                        value: item.textCell
                    };
                    break;
                case 2:
                    propertyRule = {
                        type: 'value',
                        value: item.numberCell
                    };
                    break;
                case 3:
                    propertyRule = {
                        type: 'value',
                        value: item.dateTimeCell
                    };
                    break;
                case 4:
                    propertyRule = {
                        type: 'value',
                        value: item.durationCell
                    };
                    break;
                case 5:
                    propertyRule = {
                        type: 'value',
                        value: item.referenceCell
                    };
                    break;
                case 6:
                    propertyRule = {
                        type: 'value',
                        value: item.documentCell
                    };
                    break;
                case 7:
                    propertyRule = {
                        type: 'value',
                        value: item.booleanCell
                    };
                    break;
                case 8:
                    propertyRule = {
                        type: 'value',
                        value: item.userCell
                    };
                    break;
                case 9:
                    propertyRule = {
                        type: 'context',
                        value: ['op.1']
                    };
                    break;
                case 10:
                    propertyRule = {
                        type: 'script',
                        value: 'Some script'
                    };
                    break;
                default:
                    propertyRule = {
                        type: 'expression',
                        value: 'Some expression'
                    };
                    break;
            }
            item.propertyRule = propertyRule;
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
            type: 'Text',
            dataType: 'Text',
            helpText: 'Boolean Cell',
            title: 'TextCell',
            sorting: 'asc',
            editable: true,
            width: 300
        },
        {
            key: 'numberCell',
            type: 'Number',
            title: 'Number Cell',
            helpText: 'Boolean Cell',
            editable: true,
            width: 100
        },
        {
            key: 'dateTimeCell',
            type: 'DateTime',
            title: 'DateTime Cell',
            helpText: 'Boolean Cell',
            editable: true,
            width: 100
        },
        {
            key: 'durationCell',
            type: 'Duration',
            title: 'Duration Cell',
            helpText: 'Boolean Cell',
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
            helpText: 'Reference Cell',
            editable: true,
            dataType: 'Instance',
            width: 100
        },
        {
            key: 'documentCell',
            type: 'Document',
            title: 'Document Cell',
            helpText: 'Document Cell',
            editable: true,
            showAll: true,
            width: 100
        },
        {
            key: 'propertyRule',
            type: 'Complex',
            helpText: 'Expression',
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
            id: 'pa.7',
            getReadonly: model => model.get('index') === 11,
            schemaExtension: model => {
                const index = model.get('index');
                const extension = {
                    propertyTypes: [getPropertyTypeByIndex(index)],
                    valueEditor: getValueEditorByIndex(index)
                };
                switch ((index % childLength) / 2) {
                    case 6:
                        extension.format = 'document';
                        break;
                    case 0:
                        extension.format = 'user';
                        break;
                    case 11:
                        extension.readonly = true;
                        break;
                    default:
                        break;
                }
                return extension;
            },
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
            recordTypeId: 'oa.1'
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
            title: 'Complex grid'
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
