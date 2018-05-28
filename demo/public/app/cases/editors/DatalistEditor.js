

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        DatalistValue: [{
            id: 'task.1',
            text: 'Test Reference 1'
        }]
    });

    return new CanvasView({
        view: new core.form.editors.DatalistEditor({
            model,
            key: 'DatalistValue',
            autocommit: true,
            showEditButton: true,
            showAddNewButton: true,
            showCheckboxes: true,
            maxQuantitySelected: 5,
            controller: new core.form.editors.reference.controllers.DemoReferenceEditorController()
        }),
        presentation: "[ {{#each DatalistValue}}{ id: '{{this.id}}', text: '{{this.text}}' }{{#unless @last}}, {{/unless}}{{/each}} ]",
        isEditor: true
    });
}
