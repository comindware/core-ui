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
                iconClass: 'plus',
                id: 'read',
                name: 'Read',
                type: 'Action',
                severity: 'Normal',
                resultType: 'CustomClientAction',
                context: 'Void'
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
                iconClass: 'plus',
                id: 'delete',
                name: 'Delete',
                type: 'Action',
                severity: 'Normal',
                resultType: 'CustomClientAction',
                context: 'Void'
            }
        ])
    });
}
