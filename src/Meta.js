//@flow
export const contextIconType = {
    reference: 'link',
    instance: 'link',
    instanceproperty: 'link',
    tablayout: 'folders',
    tabpanel: 'folder',
    member: 'user',
    account: 'user',
    accountproperty: 'user',
    document: 'paperclip',
    documentproperty: 'paperclip',
    grouppanel: 'list-alt',
    horizontallayout: 'columns',
    staticcontent: 'stream',
    date: 'calendar-alt',
    datetime: 'calendar-alt',
    duration: 'stopwatch',
    decimal: 'superscript',
    number: 'superscript',
    action: 'hand-pointer',
    actionbutton: 'hand-pointer',
    text: 'font',
    string: 'font',
    boolean: 'check-square',
    table: 'newspaper',
    collection: 'newspaper',
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

export const iconsNames = {
    expand: 'expand',
    minimize: 'compress',
    newTab: 'share-square',
    close: 'times'
};

export default {
    objectPropertyTypes,
    contextIconType,
    presentingComponentsTypes,
    iconsNames
};
