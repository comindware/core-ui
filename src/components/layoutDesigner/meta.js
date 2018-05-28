export const paletteIds = {
    TEXT: 'text',
    NUMBER: 'number',
    DURATION: 'duration',
    DATE: 'date',
    YES_NO: 'yesNo',
    DOCUMENT: 'document',
    REFERENCE: 'reference',
    USER: 'user',
    COLLECTION: 'collection',
    USER_DEFINED: 'userDefined',
    COLUMNS: 'columns',
    GROUP: 'group',
    TAB_LAYOUT: 'tabLayout',
    STATIC_TEXT: 'staticText',
    SEPARATOR: 'separator',
    OPERATION: 'operation'
};

export const paletteList = [
    {
        id: paletteIds.TEXT,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.TEXT')
    },
    {
        id: paletteIds.NUMBER,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.NUMBER')
    },
    {
        id: paletteIds.DURATION,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.DURATION')
    },
    {
        id: paletteIds.DATE,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.DATETIME')
    },
    {
        id: paletteIds.YES_NO,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.YESNO')
    },
    {
        id: paletteIds.DOCUMENT,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.DOCUMENT')
    },
    {
        id: paletteIds.USER,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.USER')
    },
    {
        id: paletteIds.REFERENCE,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.REFERENCE')
    },
    {
        id: paletteIds.COLLECTION,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.COLLECTION')
    },
    {
        id: paletteIds.USER_DEFINED,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.USERDEFINED')
    },
    {
        id: paletteIds.COLUMNS,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.COLUMNS')
    },
    {
        id: paletteIds.GROUP,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.GROUP')
    },
    {
        id: paletteIds.TAB_LAYOUT,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.TABLAYOUT')
    },
    {
        id: paletteIds.STATIC_TEXT,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.STATICTEXT')
    },
    {
        id: paletteIds.OPERATION,
        text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.OPERATION')
    }
    /*,
     {
     id: paletteIds.SEPARATOR,
     text: Localizer.get('PROCESS.FORMDESIGNER.PALETTE.SEPARATOR')
     }*/
];

export const componentTypes = {
    VERTICAL_LAYOUT: 'VerticalLayout',
    COLUMN_LAYOUT: 'ColumnLayout',
    HORIZONTAL_LAYOUT: 'HorizontalLayout',
    GROUP_PANEL: 'GroupPanel',
    TAB_LAYOUT: 'TabLayout',
    TAB_PANEL: 'TabPanel',
    STATIC_CONTENT: 'StaticContent',
    FIELD_COMPONENT: 'FieldComponent',
    SEPARATOR: 'Separator',
    FORM: 'SubForm',
    OPERATION: 'ActionButton',
    TABLE_COLLUMN: 'TableColumn',
    TEXT: 'String',
    DATE: 'DateTime',
    DURATION: 'Duration',
    NUMBER: 'Number',
    BOOLEAN: 'Boolean',
    MEMBER: 'Account',
    DOCUMENT: 'Document',
    REFERENCE: 'Instance',
    DROPDOWNLIST: 'DropdownList',
    COLLECTION: 'Table',
    USER_DEFINED: 'UserDefined',
    COLLECTION_COLUMN: 'TableColumn'
};

export const accessTypes = {
    HIDDEN: 'Hidden',
    ACCESS_DENIED: 'AccessDenied',
    READONLY: 'Readonly',
    EDITABLE: 'Editable',
    REQUIRED: 'Required'
};

export const palette = {
    list: paletteList,
    ids: paletteIds
};

export const editorTypes = {
    booleanEditorTypes: {
        RADIO: 'Radio',
        CHECKBOX: 'Checkbox'
    },
    textEditorTypes: {
        SIMPLE: 'Simple',
        MULTILINE: 'Multiline'
    }
};

export const editorFormats = {
    textEditorFormats: {
        htmlText: 'HtmlText',
        plainText: 'PlainText'
    }
};

export const defaultComponentProperties = {
    name: '',
    labelAlignment: 'Top',
    labelHidden: false,
    helpText: null,
    isRequired: false,
    isReadonly: false
};

export const defaultToolbarButtonId = {
    SAVE: 'save',
    SAVE_AS: 'saveAs',
    CLEAR: 'clear',
    CLONE: 'clone',
    DELETE: 'delete'
};

export const defaultToolbarButton = [
    {
        iconType: 'Undefined',
        id: defaultToolbarButtonId.SAVE,
        name: Localizer.get('PROCESS.FORMDESIGNER.SAVE.TEXT'),
        type: 'Action',
        severity: 'None',
        userCommandId: 'save'
    },
    {
        iconType: 'Undefined',
        id: defaultToolbarButtonId.SAVE_AS,
        name: Localizer.get('PROCESS.FORMDESIGNER.SAVEAS'),
        type: 'Action',
        severity: 'None',
        userCommandId: 'saveAs'
    },
    {
        iconType: 'Undefined',
        id: defaultToolbarButtonId.CLEAR,
        name: Localizer.get('PROCESS.FORMDESIGNER.CLEAR'),
        type: 'Action',
        severity: 'None',
        userCommandId: 'clear'
    },
    {
        iconType: 'Undefined',
        id: defaultToolbarButtonId.CLONE,
        name: Localizer.get('PROCESS.FORMDESIGNER.CLONE'),
        type: 'Popup',
        severity: 'None',
        userCommandId: 'clone'
    },
    {
        iconType: 'Undefined',
        id: defaultToolbarButtonId.DELETE,
        name: Localizer.get('PROCESS.FORMDESIGNER.DELETE'),
        type: 'Action',
        severity: 'None',
        userCommandId: 'delete'
    }
];

export default {
    componentTypes,
    accessTypes,
    palette,
    editorTypes,
    defaultComponentProperties,
    defaultToolbarButtonId,
    defaultToolbarButton
};
