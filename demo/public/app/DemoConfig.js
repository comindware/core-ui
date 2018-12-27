/**
 * Case path is gonna be like: core/demo/cases/{sectionId}/{groupId}/{caseId}.js
 */
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
                    id: 'MultiEditorEditor',
                    displayName: 'Multi-editor editor',
                    description: 'Multi-editor editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'AudioEditor',
                    displayName: 'Audio Editor',
                    description: 'Simple audio editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'TextEditor',
                    displayName: 'Text Editor',
                    description: 'Simple text editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'CodeEditor',
                    displayName: 'Code Editor',
                    description: 'Simple code editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'IconEditor',
                    displayName: 'Icon Editor',
                    description: 'Icon editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'ContextEditor',
                    displayName: 'Context Editor',
                    description: 'Context editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'RangeEditor',
                    displayName: 'Range Editor',
                    description: 'Simple range editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'ColorPickerEditor',
                    displayName: 'Color Picker',
                    description: 'Simple color picker editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'TextAreaEditor',
                    displayName: 'Text Area Editor',
                    description: 'Text area editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'MentionEditor',
                    displayName: 'Mention Editor',
                    description: 'Mention editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'NumberEditor',
                    displayName: 'Number Editor',
                    description: 'Simple number editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'CurrencyEditor',
                    displayName: 'Currency Editor',
                    description: 'Simple Currency editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'BooleanEditor',
                    displayName: 'Boolean Editor',
                    description: 'Simple boolean editor',
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
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DateTimeEditor',
                    displayName: 'DateTime Editor',
                    description: 'DateTime editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'TimeEditor',
                    displayName: 'Time Editor',
                    description: 'Time editor without date',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DocumentEditor',
                    displayName: 'Document editor',
                    description: 'Document editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DurationEditor',
                    displayName: 'Duration Editor',
                    description: 'Duration editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DropdownEditor',
                    displayName: 'Dropdown Editor',
                    description: 'Dropdown editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DropdownMultiEditor',
                    displayName: 'Dropdown Multi Editor',
                    description: 'Dropdown Multi editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'RadioGroupEditor',
                    displayName: 'Radio Group Editor',
                    description: 'Radio Group Editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'MemberSelectEditor',
                    displayName: 'Member Select Editor',
                    description: 'Member select editor',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DatalistEditor',
                    displayName: 'Reference Bubble Editor',
                    description: 'Data list editor with search',
                    attributesConfig: [
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        }
                    ]
                },
                {
                    id: 'DatalistSingleEditor',
                    displayName: 'Reference Single Editor',
                    description: 'Data list editor with search',
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
                        {
                            attribute: 'autocommit',
                            values: 'true, false',
                            default: 'false'
                        },
                        {
                            attribute: 'removable',
                            values: 'true, false',
                            default: 'true'
                        },
                        {
                            attribute: 'autoUpload',
                            values: 'true, false',
                            default: 'false'
                        },
                        {
                            attribute: 'refreshPreviewAfterUpload',
                            values: 'true, false',
                            default: 'false'
                        },
                        {
                            attribute: 'controller',
                            values: 'BaseAvatarEditorController',
                            default: 'undefined'
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
