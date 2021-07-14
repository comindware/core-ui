import LocalizationService from 'services/LocalizationService';

const meta = {
    logoItem: 'newspaper',
    socialLinksLoginPage: 'globe',
    linksLoginPage: 'external-link',
    infoNewsItem: 'info-square',
    formRoot: 'window',
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
    enums: 'list-ul',
    contextIconType: 'list-ul',
    grouppanel: 'list-alt',
    horizontallayout: 'columns',
    integer: 'superscript',
    staticcontent: 'stream',
    date: 'calendar-alt',
    datetime: 'calendar-alt',
    duration: 'stopwatch',
    decimal: 'superscript',
    number: 'superscript',
    action: 'hand-pointer',
    role: 'user-shield',
    orgStructureTemplate: 'sitemap',
    orgStructure: 'sitemap',
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
    group: 'clone',
    chart: 'file-chart-pie',
    roleTemplate: 'user-shield',
    organizationalUnit: 'sitemap'
};

Object.entries(meta).forEach(([key, value]) => {
    const keyUp = key[0].toUpperCase() + key.slice(1);
    meta[keyUp] = value;
});

export const contextIconType = meta;

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
    IMAGE: 'Image',
    INSTANCE: 'Instance',
    COLLECTION: 'Collection',
    ENUM: 'Enum',
    ROLE: 'Role',
    ORGANIZATION_UNIT: 'OrganizationalUnit'
};

export const fieldTypes = {
    Text: 'text',
    Number: 'number',
    Duration: 'duration',
    DateTime: 'dateTime',
    Date: 'date',
    Boolean: 'boolean',
    Document: 'document',
    Datalist: 'dataList',
    RadioGroup: 'radioGroup'
};

export const presentingComponentsTypes = {
    form: 'form',
    popup: 'popup',
    group: 'group',
    field: 'field',
    tab: 'tab'
};

export const iconsNames = {
    close: 'times',
    delete: 'trash-alt',
    download: 'download',
    expand: 'expand',
    goTo: 'external-link-square',
    minimize: 'compress',
    next: 'chevron-right',
    preview: 'search',
    previous: 'chevron-left',
    user: 'address-card',
    users: 'users',
    zoomIn: 'search-plus',
    zoomOut: 'search-minus',
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

export const virtualCollectionFilterActions = {
    PUSH: 'push',
    REMOVE: 'remove'
};

export const splitViewTypes = {
    UNDEFINED: 'Undefined',
    GENERAL: 'General',
    VERTICAL: 'SplitVertical',
    HORIZONTAL: 'SplitHorizontal'
};

export const complexValueTypes = {
    value: 'value',
    context: 'context',
    expression: 'expression',
    script: 'script',
    template: 'template'
};

export const getComplexValueTypesLocalization = (complexValueType: string) => {
    switch (complexValueType) {
        case complexValueTypes.value:
            return LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.VALUE');
        case complexValueTypes.context:
            return LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.ATTRIBUTE');
        case complexValueTypes.expression:
            return LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.EXPRESSION');
        case complexValueTypes.script:
            return LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.CSHARPSCRIPT');
        case complexValueTypes.template:
            return LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.TEMPLATE');
        default:
            return '';
    }
};

export const validationSeverityTypes = {
    ERROR: 'error',
    WARNING: 'warning'
};

export const validationSeverityClasses = {
    ERROR: 'error',
    WARNING: 'warning'
};

export const DOUBLECLICK_DELAY = 500;

export const formComponentTypes = {
    verticalLayout: 'v-container',
    horizontalLayout: 'h-container',
    tabs: 'tabs',
    group: 'group',
    popup: 'popup',
    button: 'button',
    grid: 'grid',
    toolbar: 'toolbar',
    plainText: 'plainText',
    custom: 'custom'
};

export default {
    objectPropertyTypes,
    fieldTypes,
    contextIconType,
    presentingComponentsTypes,
    splitViewTypes,
    iconsNames,
    objectPropertyFormats,
    complexValueTypes,
    validationSeverityTypes,
    validationSeverityClasses,
    getComplexValueTypesLocalization,
    DOUBLECLICK_DELAY,
    formComponentTypes
};
