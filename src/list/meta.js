export const contextTypes = {
    void: 'void',
    any: 'any',
    one: 'one'
};

export const columnTypes = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    DATETIME: 'dateTime',
    HTML: 'html',
    DOCUMENT: 'document',
    decimal: 'Decimal',
    integer: 'Integer',
    datetime: 'DateTime',
    duration: 'Duration',
    string: 'String',
    boolean: 'Boolean',
    users: 'AccountProperty',
    reference: 'InstanceProperty',
    enumerable: 'EnumProperty',
    document: 'DocumentProperty',
    collection: 'Collection',
    id: 'id'
};

export const getDefaultActions = () => [
    {
        id: 'add',
        name: Localizer.get('CORE.GRID.ACTIONS.ADD'),
        iconClass: 'plus'
    },
    {
        id: 'archive',
        name: Localizer.get('CORE.GRID.ACTIONS.ARCHIVE'),
        contextType: contextTypes.any
    },
    {
        id: 'unarchive',
        name: Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE'),
        contextType: contextTypes.any
    },
    {
        id: 'delete',
        name: Localizer.get('CORE.GRID.ACTIONS.DELETE'),
        contextType: contextTypes.any
    }
];

export default {
    contextTypes,
    columnTypes,
    getDefaultActions
};
