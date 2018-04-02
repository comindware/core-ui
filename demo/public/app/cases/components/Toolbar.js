import core from 'comindware/core';

export default function() {
    return new core.components.Toolbar({
        allItemsCollection: new Backbone.Collection([
            {
                iconClass: 'plus',
                id: 'create',
                name: 'Create',
                type: 'Action',
                severity: 'Normal',
                resultType: 'CustomClientAction',
                context: 'Void'
            },
            {
                iconType: 'Undefined',
                id: 'themePicker',
                name: 'name',
                severity: 'None',
                defaultTheme: true,
                type: 'Popup',
                options: {
                    collection: new Backbone.Collection(),
                    diagramId: '1',
                    solutionId: '2',
                    buttonView: Marionette.ItemView,
                    panelView: Marionette.ItemView
                }
            },
            {
                iconClass: 'plus',
                id: 'update',
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
                id: 'delete',
                name: 'Delete',
                type: 'Action',
                severity: 'Normal',
                resultType: 'CustomClientAction',
                context: 'Void'
            },
            {
                iconType: 'Undefined',
                type: 'Checkbox',
                isShowAliases: false,
                id: 'setDef',
                name: 'Check the checkbox',
                severity: 'None',
                defaultTheme: true
            }
        ])
    });
}
