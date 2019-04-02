export default function() {
    const blinkColumns = new Backbone.Collection([
        {
            id: 'blink.1',
            name: 'First',
            isHidden: false
        },
        {
            id: 'blink.2',
            name: 'Second',
            isHidden: true
        },
        {
            id: 'blink.3',
            name: 'Third',
            isHidden: false
        }
    ]);

    blinkColumns.on('change:isHidden', (model, value) => alert(`isHidden = ${value}`));
    const toolbarView = new Core.components.Toolbar({
        mode: 'Mobile',
        allItemsCollection: new Backbone.Collection([
            {
                iconClass: 'plus',
                id: '1',
                name: 'Create',
                type: 'Action',
                severity: 'Low',
                description: 'createComponent'
            },
            {
                iconClass: 'dog',
                id: '2',
                name: 'Some',
                type: 'Search',
                severity: 'Low',
                description: 'createComponent'
            },
            {
                // iconClass: 'plus',
                id: '3',
                name: 'Eyes',
                kind: 'Const',
                type: 'BlinkCheckbox',
                severity: 'Normal',
                columns: blinkColumns
            },
            {
                type: 'Splitter'
            },
            {
                iconClass: 'minus',
                id: '4',
                name: 'Delete',
                type: 'Action',
                severity: 'Major',
                context: 'Void'
            },
            {
                iconClass: 'Undefined', //will be set by selected state.
                type: 'SplitButton',
                id: '32',
                name: 'SplitButton',
                severity: 'Normal',
                stateIndex: 2,
                items: [
                    {
                        id: 'headLine',
                        type: 'Headline',
                        name: 'some header'
                    },
                    {
                        id: 'firstState',
                        iconClass: 'align-left',
                        name: 'Left'
                    },
                    {
                        id: 'secondState',
                        iconClass: 'align-center',
                        name: 'Center'
                    },
                    {
                        id: 'thirdState',
                        iconClass: 'align-right',
                        name: 'Right'
                    },
                    {
                        id: 'fourthState',
                        iconClass: 'align-justify',
                        name: 'Justify'
                    }
                ]
            },
            {
                iconClass: 'Undefined', //will be set by selected state.
                type: 'SplitButton',
                id: '33',
                name: 'SplitButton',
                kind: 'Const',
                severity: 'Major',
                juggleStates: true,
                stateIndex: 1,
                items: [
                    {
                        id: 'firstState',
                        iconClass: 'align-left',
                        name: 'Left'
                    },
                    {
                        id: 'secondState',
                        iconClass: 'align-center',
                        name: 'Center'
                    },
                    {
                        id: 'thirdState',
                        iconClass: 'align-right',
                        name: 'Right'
                    },
                    {
                        id: 'fourthState',
                        iconClass: 'align-justify',
                        name: 'Justify'
                    }
                ]
            },
            {
                iconClass: 'Undefined', //will be set by selected state.
                type: 'SelectState',
                id: '5',
                name: 'SelectState',
                severity: 'Critical',
                items: [
                    {
                        id: 'headLine',
                        type: 'Headline',
                        name: 'some header'
                    },
                    {
                        id: 'firstState',
                        iconClass: 'align-left',
                        name: 'Left'
                    },
                    {
                        id: 'secondState',
                        iconClass: 'align-center',
                        name: 'Center'
                    },
                    {
                        id: 'thirdState',
                        iconClass: 'align-right',
                        name: 'Right'
                    },
                    {
                        id: 'fourthState',
                        iconClass: 'align-justify',
                        name: 'Justify'
                    }
                ]
            },
            {
                iconType: 'Undefined',
                type: 'Checkbox',
                id: '6',
                name: 'Check the checkbox',
                severity: 'Critical'
            },
            {
                iconType: 'Undefined',
                type: 'Action',
                id: '7',
                name: 'Check the checkbox',
                severity: 'Fatal'
            },
            {
                name: 'Группа',
                class: 'buttonclass',
                dropdownClass: 'dropdownClass',
                order: 5,
                type: 'Group',
                iconType: 'Undefined',
                iconClass: 'low-vision',
                severity: 'None',
                items: [
                    { userCommandId: 'event.1', name: 'Delete', class: 'buttonClass', order: 0, type: 'Action', iconType: 'Undefined', iconClass: 'braille', severity: 'None', skipValidation: false, kind: 'Delete', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } },
                    { userCommandId: 'event.2', name: 'Create', order: 1, type: 'Action', iconType: 'Undefined', iconClass: 'wheelchair', severity: 'None', skipValidation: false, kind: 'Create' },
                    { userCommandId: 'event.3', name: 'Delete', order: 2, type: 'Action', iconType: 'Undefined', severity: 'Low', skipValidation: false, kind: 'Delete', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } },
                    { userCommandId: 'event.4', name: 'Delete', order: 3, type: 'Action', iconType: 'Undefined', severity: 'Fatal', skipValidation: false, kind: 'Delete', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } }
                ]
            }
        ])
    });

    toolbarView.on('command:execute', (model, options) => console.log(model.id || model.get('userCommandId'), options));

    return toolbarView;
}
