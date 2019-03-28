import coreIcons from './form/editors/impl/iconEditor/icons.json';

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
    enum: 'list-ul',
    contextIconType: 'list-ul',
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
    undefined: 'dot-circle',
    task: 'tasks',
    record: 'list-alt',
    recordtemplate: 'list-alt',
    process: 'cogs',
    case: 'cube',
    list: 'align-justify',
    group: 'clone'
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
    goTo: 'share-square',
    close: 'times'
};

export const objectPropertyFormats = {
    INTEGER: 'Integer',
    DECIMAL: 'Decimal',
    CURRENCY: 'Currency',

    INSTANCE_ID: 'InstanceId',

    SHORT_DATE: 'ShortDate',
    LONG_DATE: 'LongDate',
    SHORT_TIME: 'ShortTime',
    LONG_TIME: 'LongTime',
    LONG_DATE_SHORT_TIME: 'LongDateShortTime',
    LONG_DATE_LONG_TIME: 'LongDateLongTime',
    SHORT_DATE_SHORT_TIME: 'ShortDateShortTime',
    SHORT_DATE_LONG_TIME: 'ShortDateLongTime',
    CONDENSED_DATE_SHORT_TIME: 'CondensedDateTime',
    CONDENSED_DATE: 'CondensedDate',
    MONTH_DAY: 'MonthDay',
    YEAR_MONTH: 'YearMonth',
    DATE_ISO: 'DateISO',
    DATE_TIME_ISO: 'DateTimeISO',

    D_H_M_S: 'DurationFullShort',
    H_M_S: 'DurationHMS',
    H_M: 'DurationHM',
    FULL_LONG: 'DurationFullLong',
    ISO: 'DurationISO',
    INVARIANT: 'DurationInvariant',

    TEXT: 'Text',
    LINK: 'Link',

    PLAIN_TEXT: 'PlainText',
    HTML_TEXT: 'HtmlText'
};

export default {
    objectPropertyTypes,
    contextIconType,
    presentingComponentsTypes,
    iconsNames,
    coreIcons,
    objectPropertyFormats
};
