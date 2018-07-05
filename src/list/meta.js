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
    },
    {
        id: 'toggleShowArchived',
        name: Localizer.get('CORE.GRID.ACTIONS.SHOWARCHIVED'),
        checkbox: true
    }
];

export default {
    contextTypes,
    columnTypes,
    getDefaultActions
};
