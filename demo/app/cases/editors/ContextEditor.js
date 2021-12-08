import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    return new CanvasView({
        view: new Core.form.editors.ContextSelectEditor({
            key: 'context',
            usePropertyTypes: false,
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
                        id: 'id',
                        alias: 'id_alias'
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
                        id: 'lastModifier',
                        alias: 'lastModifier_alias'
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
                        id: 'lastWriteDate',
                        alias: 'lastWriteDate_alias'
                    },
                    {
                        instanceTypeId: 'oa.1',
                        type: 'Instance',
                        format: 'Undefined',
                        name: 'coll',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'op.2',
                        alias: 'op.2_alias'
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
                        id: 'op.1',
                        alias: 'op.1_alias'
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
                        id: 'creationDate',
                        alias: 'creationDate_alias'
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
                        id: 'isDisabled',
                        alias: 'isDisabled_alias'
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
                        id: 'creator',
                        alias: 'creator_alias'
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
                        id: 'op.10',
                        alias: 'op.10_alias'
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
                        id: 'op.13',
                        alias: 'op.13_alias'
                    },
                    {
                        instanceTypeId: 'oa.1',
                        type: 'Instance',
                        format: 'Undefined',
                        name: 'coll',
                        displayAttribute: false,
                        isBuiltIn: false,
                        calculated: false,
                        isSystem: false,
                        isDisabled: false,
                        id: 'op.14',
                        alias: 'op.14_alias'
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
                        id: 'engine:id',
                        alias: 'engine:id_alias'
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
                        id: 'id',
                        alias: 'id_alias'
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
                        id: 'creator',
                        alias: 'creator_alias'
                    }
                ]
            },
            recordTypeId: 'oa.1'
        }),
        presentation: '{{value}}',
        isEditor: true
    });
}
