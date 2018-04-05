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
    DOCUMENT: 'document'
};

export const defaultActions = [
    {
        id: 'addNew',
        name: 'addNew',
        iconClass: 'plus'
    },
    {
        id: 'archive',
        name: 'archive',
        contextType: contextTypes.any
    },
    {
        id: 'unarchive',
        name: 'unarchive',
        contextType: contextTypes.any
    },
    {
        id: 'delete',
        name: 'delete',
        contextType: contextTypes.any
    }
];

export default {
    contextTypes,
    columnTypes,
    defaultActions
};
