/**
 * Developer: Stepan Burguchev
 * Date: 07/27/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/**
 * Case path is gonna be like: core/demo/cases/{sectionId}/{groupId}/{caseId}.js
 */
export default {
    sections: [
        {
            id: 'editors',
            displayName: 'Editors',
            groups: [{
                id: 'AudioEditor',
                displayName: 'Audio Editor'
            }, {
                id: 'TextEditor',
                displayName: 'Text Editor'
            }, {
                id: 'CodeEditor',
                displayName: 'Code Editor'
            }, {
                id: 'RangeEditor',
                displayName: 'Range Editor'
            }, {
                id: 'ColorPickerEditor',
                displayName: 'Color Picker'
            }, {
                id: 'TextAreaEditor',
                displayName: 'Text Area Editor'
            }, {
                id: 'NumberEditor',
                displayName: 'Number Editor'
            }, {
                id: 'BooleanEditor',
                displayName: 'Boolean Editor'
            }, {
                id: 'DateEditor',
                displayName: 'Date Editor'
            }, {
                id: 'DateTimeEditor',
                displayName: 'DateTime Editor'
            }, {
                id: 'TimeEditor',
                displayName: 'Time Editor'
            }, {
                id: 'DocumentEditor',
                displayName: 'Document editor'
            }, {
                id: 'DurationEditor',
                displayName: 'Duration Editor'
            }, {
                id: 'DropdownEditor',
                displayName: 'Dropdown Editor'
            }, {
                id: 'MultiSelectEditor',
                displayName: 'MultiSelect Editor'
            }, {
                id: 'RadioGroupEditor',
                displayName: 'Radio Group Editor'
            }, {
                id: 'PasswordEditor',
                displayName: 'Password Editor'
            },
                {
                    id: 'MemberSelectEditor',
                    displayName: 'Member Select Editor'
                }, {
                    id: 'MembersBubbleEditor',
                    displayName: 'Members Bubble Editor'
                }, {
                    id: 'MentionEditor',
                    displayName: 'Mention Editor'
                },
                {
                    id: 'ReferenceBubbleEditor',
                    displayName: 'Reference Bubble Editor'
                },
                {
                    id: 'MaskedTextEditor',
                    displayName: 'Masked Text Editor'
                },
                {
                    id: 'AvatarEditor',
                    displayName: 'Avatar Editor'
                },
                {
                    id: 'DurationEditorWithPartialDisplay',
                    displayName: 'Duration Editor (partial display)'
                },
                {
                    id: 'ReferenceEditorWithAddNewButton',
                    displayName: 'Reference Editor (Add new button)'
                },
                {
                    id: 'Form',
                    displayName: 'Form'
                },
                {
                    id: 'FormValidation',
                    displayName: 'Form Validation (all editors)'
                }
            ]
        },
        {
            id: 'dropdown',
            displayName: 'Dropdown & Popout',
            groups: [
                {
                    id: 'actionMenu',
                    displayName: 'Action Menu',
                    description: 'Для создания простого меню с командами мы используем метод core.dropdown.factory.createMenu из фабрики дропдаунов.' +
                    '\r\n\r\n' +
                    'Метод возвращает обычный PopoutView, настроенный для отображения меню.'
                },
                {
                    id: 'popoutCustomization',
                    displayName: 'Popout (Custom Views)',
                    description: ''
                },
                {
                    id: 'popoutCustomAnchor',
                    displayName: 'Popout (Custom Anchor)',
                    description: ''
                },
                {
                    id: 'popoutDialog',
                    displayName: 'Popout (Dialog)',
                    description: ''
                },
                {
                    id: 'dropdownCustomization',
                    displayName: 'Dropdown (Customization)',
                    description: ''
                },
                {
                    id: 'dropdownPanelPosition',
                    displayName: 'Dropdown (Panel Position)',
                    description: ''
                }
            ]
        },
        {
            id: 'layout',
            displayName: 'Layout',
            groups: [
                {
                    id: 'TabLayout',
                    displayName: 'Tab Layout',
                    description: ''
                },
                {
                    id: 'VerticalLayout',
                    displayName: 'Vertical Layout',
                    description: ''
                },
                {
                    id: 'HorizontalLayout',
                    displayName: 'Horizontal Layout',
                    description: ''
                },
                {
                    id: 'GroupView',
                    displayName: 'Group',
                    description: ''
                },
                {
                    id: 'Button',
                    displayName: 'Button',
                    description: ''
                },
                {
                    id: 'PopupView',
                    displayName: 'Popup View',
                    description: ''
                },
                {
                    id: 'AttachedFields',
                    displayName: 'Using with FormBehavior',
                    description: ''
                },
                {
                    id: 'FormView',
                    displayName: 'Using with Form View',
                    description: ''
                },
                {
                    id: 'DynamicState',
                    displayName: 'Computed Visibility',
                    description: ''
                },
                {
                    id: 'DetachedFields',
                    displayName: 'Special Cases (Detached Fields)',
                    description: ''
                }
            ]
        },
        {
            id: 'list',
            displayName: 'List & Grid',
            groups: [
                {
                    id: 'listBasicUsage',
                    displayName: 'List (Basic Usage)'
                },
                {
                    id: 'listSearchHighlight',
                    displayName: 'List (Search & Highlight)'
                },
                {
                    id: 'listGroupBy',
                    displayName: 'List (Group By)'
                },
                {
                    id: 'grid',
                    displayName: 'Grid'
                },
                {
                    id: 'nativeGrid',
                    displayName: 'Grid (With native scroll)'
                },
                {
                    id: 'editableGrid',
                    displayName: 'Editable Grid'
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
                    id: 'messageService',
                    displayName: 'Message Service'
                },
                {
                    id: 'windowsService',
                    displayName: 'Windows Service'
                },
                {
                    id: 'localizationService',
                    displayName: 'Localization Service'
                },
                {
                    id: 'loadingBehavior',
                    displayName: 'Loading Behavior'
                }
            ]
        }
    ]
};
