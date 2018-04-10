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
                    id: 'GroupView',
                    displayName: 'Group',
                    description: 'Group'
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
                }
            ]
        },
        {
            id: 'editors',
            displayName: 'From and editors',
            groups: [
                {
                    id: 'AudioEditor',
                    displayName: 'Audio Editor',
                    description: 'Simple audio editor'
                },
                {
                    id: 'TextEditor',
                    displayName: 'Text Editor',
                    description: 'Simple text editor'
                },
                {
                    id: 'CodeEditor',
                    displayName: 'Code Editor',
                    description: 'Simple code editor'
                },
                {
                    id: 'ContextEditor',
                    displayName: 'Context Editor',
                    description: 'Context editor'
                },
                {
                    id: 'RangeEditor',
                    displayName: 'Range Editor',
                    description: 'Simple range editor'
                },
                {
                    id: 'ColorPickerEditor',
                    displayName: 'Color Picker',
                    description: 'Simple color picker editor'
                },
                {
                    id: 'TextAreaEditor',
                    displayName: 'Text Area Editor',
                    description: 'Text area editor'
                },
                {
                    id: 'NumberEditor',
                    displayName: 'Number Editor',
                    description: 'Simple number editor'
                },
                {
                    id: 'BooleanEditor',
                    displayName: 'Boolean Editor',
                    description: 'Simple boolean editor'
                },
                {
                    id: 'DateEditor',
                    displayName: 'Date Editor',
                    description: 'Date editor without time'
                },
                {
                    id: 'DateTimeEditor',
                    displayName: 'DateTime Editor',
                    description: 'Date editor'
                },
                {
                    id: 'TimeEditor',
                    displayName: 'Time Editor',
                    description: 'Time editor without time'
                },
                {
                    id: 'DocumentEditor',
                    displayName: 'Document editor',
                    description: 'Document editor'
                },
                {
                    id: 'DurationEditor',
                    displayName: 'Duration Editor',
                    description: 'Duration editor'
                },
                {
                    id: 'DropdownEditor',
                    displayName: 'Dropdown Editor',
                    description: 'Dropdown editor'
                },
                {
                    id: 'RadioGroupEditor',
                    displayName: 'Radio Group Editor',
                    description: 'Radio Group Editor'
                },
                {
                    id: 'PasswordEditor',
                    displayName: 'Password Editor',
                    description: 'Text editor mimic in passwords'
                },
                {
                    id: 'MemberSelectEditor',
                    displayName: 'Member Select Editor',
                    description: 'Simple text editor'
                },
                {
                    id: 'MentionEditor',
                    displayName: 'Mention Editor',
                    description: 'Simple text editor'
                },
                {
                    id: 'DatalistEditor',
                    displayName: 'Reference Bubble Editor',
                    description: 'Data list editor with search'
                },
                {
                    id: 'MaskedTextEditor',
                    displayName: 'Masked Text Editor',
                    description: 'Simple text editor'
                },
                {
                    id: 'AvatarEditor',
                    displayName: 'Avatar Editor',
                    description: 'Simple text editor'
                },
                {
                    id: 'DurationEditorWithPartialDisplay',
                    displayName: 'Duration Editor (partial display)'
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
                    id: 'listGroupBy',
                    displayName: 'List (Group By)',
                    description: 'List with grouping'
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
                    id: 'LocalizationService',
                    displayName: 'Localization Service'
                },
                {
                    id: 'ToastNotificationsService',
                    displayName: 'Toast notification Service'
                },
                {
                    id: 'WindowsService',
                    displayName: 'Windows Service'
                },
                {
                    id: 'MessageService',
                    displayName: 'Message Service'
                }
            ]
        }
    ]
};
