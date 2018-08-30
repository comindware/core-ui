//@flow
export const contextIconType = {
    reference: 'link',
    member: 'user',
    document: 'paperclip',
    date: 'calendar-alt',
    duration: 'stopwatch',
    actionbutton: 'hand-pointer',
    text: 'font',
    boolean: 'check-square',
    table: 'newspaper',
    subform: 'list-alt',
    undefined: 'dot-circle'
};

export const objectPropertyTypes = {
    STRING: 'String',
    EXTENDED_STRING: 'ExtendedString',
    BOOLEAN: 'Boolean',
    DATETIME: 'DateTime',
    DURATION: 'Duration',
    DECIMAL: 'Decimal',
    INTEGER: 'Integer',
    DOUBLE: 'Double',
    ACCOUNT: 'Account',
    DOCUMENT: 'Document',
    INSTANCE: 'Instance',
    COLLECTION: 'Collection',
    ENUM: 'Enum'
};

export const presentingComponentsTypes = {
    form: 'form',
    popup: 'popup',
    group: 'group',
    field: 'field',
    tab: 'tab'
};

export default {
    objectPropertyTypes,
    contextIconType,
    presentingComponentsTypes
};
