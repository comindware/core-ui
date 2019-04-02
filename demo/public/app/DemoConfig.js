/**
 * Case path is gonna be like: core/demo/cases/{sectionId}/{groupId}/{caseId}.js
 */
import { valueEditorTypes } from './meta';

const commonAttributes = {
    allowEmptyValue: {
        attribute: 'allowEmptyValue',
        values: 'true, false, null',
        valueEditorType: 'Datalist',
        default: 'true',
        description: 'Specifies the ability to leave the value blank.'
    },
    autocommit: {
        attribute: 'autocommit',
        values: 'true, false, null',
        valueEditorType: 'Datalist',
        default: 'false',
        selectedValue: 'true',
        description: "Allows to automatically change model's attribute, bound to editor."
    },
    changeMode: {
        attribute: 'changeMode',
        values: 'keydown, blur',
        valueEditorType: 'Datalist',
        selectedValue: 'blur',
        description: 'Select on what event the model changes.'
    },
    emptyPlaceholder: {
        attribute: 'emptyPlaceholder',
        valueEditorType: 'Text',
        description: 'Hint displayed if input field is empty.'
    }
};

export default {
    sections: [
        {
            id: 'components',
            displayName: 'Components',
            groups: [
                {
                    id: 'Form',
                    displayName: 'Form using form behaviour',
                    description: 'Form using form behaviour'
                },
                {
                    id: 'TabLayout',
                    displayName: 'Tab Layout',
                    description: 'Tab Layout'
                },
                {
                    id: 'FormLayout',
                    displayName: 'Form Layout',
                    description: 'Form Layout'
                },
                {
                    id: 'FormOldSyntaxContent',
                    displayName: '!! Deprecated!! Form Layout from old Syntax (content in options)',
                    description: 'Deprecated!! Form Layout from old Syntax (content in options)'
                },
                {
                    id: 'GroupView',
                    displayName: 'Group',
                    description: 'Group'
                },
                {
                    id: 'GroupNestedView',
                    displayName: 'Nested Group',
                    description: 'Nested Group'
                },
                {
                    id: 'Button',
                    displayName: 'Button',
                    description: 'Button'
                },
                {
                    id: 'PopupView',
                    displayName: 'Popup View',
                    description: 'Popup View'
                },
                {
                    id: 'PopupViewLayoutForm',
                    displayName: 'PopupView with new Form Syntax',
                    description: 'PopupView with new Form Syntax'
                },
                {
                    id: 'MessageBox',
                    displayName: 'Message Box',
                    description: 'Message Box'
                },
                {
                    id: 'NavigationDrawer',
                    displayName: 'Navigation Drawer',
                    description: 'Navigation Drawer'
                },
                {
                    id: 'Toolbar',
                    displayName: 'Toolbar',
                    description: 'Toolbar'
                },
                {
                    id: 'Dropdown',
                    displayName: 'Dropdown',
                    description: 'Dropdown'
                },
                {
                    id: 'BreadCrumbs',
                    displayName: 'BreadCrumbs',
                    description: ''
                },
                {
                    id: 'VideoChat',
                    displayName: 'VideoChat',
                    description: ''
                }
            ]
        },
        {
            id: 'editors',
            displayName: 'Forms and editors',
            groups: [
                {
                    id: 'TextEditor',
                    displayName: 'Text Editor',
                    description: 'Simple text editor',
                    attributesConfig: [
                        commonAttributes.autocommit,
                        commonAttributes.changeMode,
                        commonAttributes.allowEmptyValue,
                        commonAttributes.emptyPlaceholder,
                        {
                            attribute: 'maxLength',
                            valueEditorType: 'Number',
                            default: '0',
                            description: 'Limits number of characters in string. Value "0" (zero) - means "not limited"'
                        },
                        {
                            attribute: 'mask',
                            valueEditorType: valueEditorTypes ? valueEditorTypes.ARRAY : [],
                            // selectedValue: "['(', /[1-9]/, /d/, /d/, ')', ' ', /d/, /d/, /d/, '-', /d/, /d/, /d/, /d/]",
                            description:
                                "An array or a function that defines how the user input is going to be masked. Example: ['(', /[1-9]/, /d/, /d/, ')', ' ', /d/, /d/, /d/, '-', /d/, /d/, /d/, /d/]"
                        },
                        {
                            attribute: 'maskOptions',
                            valueEditorType: 'ObjectTree',
                            nestedattributesConfigs: [
                                {
                                    attribute: 'guide',
                                    values: 'true, false, null',
                                    valueEditorType: 'Datalist',
                                    default: 'true',
                                    description: 'Tells the component whether to be in guide or no guide mode.'
                                },
                                {
                                    attribute: 'placeholderChar',
                                    default: '_',
                                    description: 'The placeholder character represents the fillable spot in the mask.'
                                },
                                {
                                    attribute: 'keepCharPositions',
                                    values: 'true, false, null',
                                    valueEditorType: 'Datalist',
                                    default: 'false',
                                    description: 'Changes the general behavior of the Text Mask component.'
                                },
                                {
                                    attribute: 'pipe',
                                    description: 'A function that will give the opportunity to modify the conformed value before it is displayed on the screen.'
                                },
                                {
                                    attribute: 'showMask',
                                    values: 'true, false',
                                    valueEditorType: 'Datalist',
                                    default: 'true',
                                    description:
                                        'Tells the Text Mask component to display the mask as a placeholder in place of the regular placeholder when the input element value is empty.'
                                }
                            ],
                            default: '{}',
                            selectedValue: '...',
                            description:
                                '<a href="https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md#readme" target="_blank">Click here to read the docs</a>'
                        },
                        {
                            attribute: 'format',
                            values: 'phone, email, null',
                            valueEditorType: 'Datalist',
                            default: 'null',
                            description: 'to do || Format bla bla bla ( to do )'
                        },
                        {
                            attribute: 'showTitle',
                            values: 'true, false, null',
                            valueEditorType: 'Datalist',
                            default: 'true',
                            description: 'Sets show title hint or not.'
                        },
                        {
                            attribute: 'readonlyPlaceholder',
                            description: 'Same as emptyPlaceholder, but only in "redonly" or "disabled" modes.'
                        },
                        {
                            attribute: 'class',
                            description: 'Defines CSS class.'
                        },
                        {
                            attribute: 'placeholderChar',
                            description: 'The placeholder character represents the fillable spot in the mask.'
                        }
                    ]
                },
                {
                    id: 'MultiEditorEditor',
                    displayName: 'Multi-editor editor',
                    description: 'Multi-editor editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'AudioEditor',
                    displayName: 'Audio Editor',
                    description: 'Simple audio editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'CodeEditor',
                    displayName: 'Code Editor',
                    description: 'Simple code editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'IconEditor',
                    displayName: 'Icon Editor',
                    description: 'Icon editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'ContextEditor',
                    displayName: 'Context Editor',
                    description: 'Context editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'RangeEditor',
                    displayName: 'Range Editor',
                    description: 'Simple range editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'ColorPickerEditor',
                    displayName: 'Color Picker',
                    description: 'Simple color picker editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'TextAreaEditor',
                    displayName: 'Text Area Editor',
                    description: 'Text area editor',
                    attributesConfig: [commonAttributes.autocommit, commonAttributes.changeMode, commonAttributes.emptyPlaceholder]
                },
                {
                    id: 'MentionEditor',
                    displayName: 'Mention Editor',
                    description: 'Mention editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'NumberEditor',
                    displayName: 'Number Editor',
                    description: 'Simple number editor',
                    attributesConfig: [commonAttributes.autocommit, commonAttributes.changeMode]
                },
                {
                    id: 'CurrencyEditor',
                    displayName: 'Currency Editor',
                    description: 'Simple Currency editor',
                    attributesConfig: [commonAttributes.autocommit, commonAttributes.changeMode]
                },
                {
                    id: 'BooleanEditor',
                    displayName: 'Boolean Editor',
                    description: 'Simple boolean editor',
                    attributesConfig: [commonAttributes.autocommit, commonAttributes.changeMode]
                },
                {
                    id: 'BooleanGroupEditor',
                    displayName: 'Boolean Group Editor',
                    description: 'Group boolean editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DateEditor',
                    displayName: 'Date Editor',
                    description: 'Date editor without time',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'DateTimeEditor',
                    displayName: 'DateTime Editor',
                    description: 'DateTime editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'TimeEditor',
                    displayName: 'Time Editor',
                    description: 'Time editor without date',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'DocumentEditor',
                    displayName: 'Document editor',
                    description: 'Document editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'DurationEditor',
                    displayName: 'Duration Editor',
                    description: 'Duration editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'DropdownEditor',
                    displayName: 'Dropdown Editor',
                    description: 'Dropdown editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'DropdownMultiEditor',
                    displayName: 'Dropdown Multi Editor',
                    description: 'Dropdown Multi editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'RadioGroupEditor',
                    displayName: 'Radio Group Editor',
                    description: 'Radio Group Editor',
                    attributesConfig: [commonAttributes.autocommit, commonAttributes.changeMode]
                },
                {
                    id: 'MemberSelectEditor',
                    displayName: 'Member Select Editor',
                    description: 'Member select editor',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'DatalistEditor',
                    displayName: 'Reference Bubble Editor',
                    description: 'Data list editor with search',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'DatalistSingleEditor',
                    displayName: 'Reference Single Editor',
                    description: 'Data list editor with search',
                    attributesConfig: [commonAttributes.autocommit]
                },
                {
                    id: 'UserEditor',
                    displayName: 'User Editor',
                    description: 'User Editor (preset for Datalist)',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DocumentSimpleEditor',
                    displayName: 'Document Simple Editor',
                    description: 'Document Editor (preset for Datalist)',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'AvatarEditor',
                    displayName: 'Avatar Editor',
                    description: 'Avatar editor',
                    attributesConfig: [
                        commonAttributes.autocommit,
                        {
                            attribute: 'removable',
                            values: 'true, false',
                            default: 'true',
                            description: 'to do'
                        },
                        {
                            attribute: 'autoUpload',
                            values: 'true, false',
                            default: 'false',
                            description: 'to do'
                        },
                        {
                            attribute: 'refreshPreviewAfterUpload',
                            values: 'true, false',
                            default: 'false',
                            description: 'to do'
                        },
                        {
                            attribute: 'controller',
                            values: 'BaseAvatarEditorController',
                            default: 'undefined',
                            description: 'to do'
                        }
                    ]
                }
            ]
        },
        {
            id: 'list',
            displayName: 'Grid and list',
            groups: [
                {
                    id: 'listBasicUsage',
                    displayName: 'List (Basic Usage)',
                    description: 'Basic use of list'
                },
                {
                    id: 'listSearchHighlight',
                    displayName: 'List (Search & Highlight)',
                    description: 'List with search'
                },
                {
                    id: 'grid',
                    displayName: 'Grid',
                    description: 'Simple grid'
                },
                {
                    id: 'gridSearchAndSelection',
                    displayName: 'Grid (Search & Selection)',
                    description: 'Grid with search and selection'
                },
                {
                    id: 'editableGrid',
                    displayName: 'Editable Grid',
                    description: 'Grid with editable cells'
                },
                {
                    id: 'treeGrid',
                    displayName: 'Tree Grid',
                    description: 'Tree-like Grid'
                },
                {
                    id: 'complexGrid',
                    displayName: 'Complex grid',
                    description: 'Mega Grid'
                },
                {
                    id: 'compactGrid',
                    displayName: 'Compact grid',
                    description: 'Mega mini Grid'
                }
            ]
        },
        {
            id: 'other',
            displayName: 'Other stuff',
            groups: [
                {
                    id: 'splitPanel',
                    displayName: 'Split Panel',
                    description: 'Panels are resizable, drag the splitter!'
                },
                {
                    id: 'loadingBehavior',
                    displayName: 'Loading Behavior'
                }
            ]
        },
        {
            id: 'services',
            displayName: 'Core services',
            groups: [
                {
                    id: 'ToastNotificationsService',
                    displayName: 'Toast notification Service',
                    description: 'Toast notification Service'
                },
                {
                    id: 'MessageService',
                    displayName: 'Message Service',
                    description: 'Message Service'
                }
            ]
        }
    ]
};
