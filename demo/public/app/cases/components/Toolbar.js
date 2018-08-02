export default function () {
    return new core.components.Toolbar({
        allItemsCollection: new Backbone.Collection([
            {
                iconClass: 'plus',
                id: '1',
                name: 'Create',
                type: 'Action',
                severity: 'Low',
                resultType: 'CustomClientAction',
                context: 'Void'
            },
            {
                iconType: 'Undefined',
                id: '2',
                name: 'name',
                severity: 'None',
                defaultTheme: true,
                type: 'Popup',
                options: {
                    collection: new Backbone.Collection(),
                    diagramId: '1',
                    solutionId: '2',
                    buttonView: Marionette.View.extend({ template: false }),
                    panelView: Marionette.View.extend({ template: false })
                }
            },
            {
                iconClass: 'plus',
                id: '3',
                name: 'Update',
                type: 'Action',
                severity: 'Normal',
                resultType: 'CustomClientAction',
                context: 'Void'
            },
            {
                type: 'Splitter'
            },
            {
                iconClass: 'plus',
                id: '4',
                name: 'Delete',
                type: 'Action',
                severity: 'Major',
                resultType: 'CustomClientAction',
                context: 'Void'
            },
            {
                iconType: 'Undefined',
                type: 'Action',
                id: '5',
                name: 'Check the checkbox',
                severity: 'Critical'
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
                name: 'Группа', class: 'buttonclass', dropdownClass: 'dropdownClass', order: 5, type: 'Group', iconType: 'Undefined', iconClass: 'low-vision', severity: 'None', items: [{ userCommandId: 'event.176', name: 'Delete', class: 'buttonClass', order: 0, type: 'Action', iconType: 'Undefined', iconClass: 'braille', severity: 'None', skipValidation: false, kind: 'Delete', resultType: 'DataChange', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } },
                { userCommandId: 'event.1', name: 'Create', order: 1, type: 'Action', iconType: 'Undefined', iconClass: 'wheelchair', severity: 'None', skipValidation: false, kind: 'Create', resultType: 'DataChange' },
                { userCommandId: 'event.176', name: 'Delete', order: 2, type: 'Action', iconType: 'Undefined', severity: 'None', skipValidation: false, kind: 'Delete', resultType: 'DataChange', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } },
                { userCommandId: 'event.176', name: 'Delete', order: 3, type: 'Action', iconType: 'Undefined', severity: 'None', skipValidation: false, kind: 'Delete', resultType: 'DataChange', confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' } }]
            }
        ])
    });
}
