

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        DatalistValue: [{
            id: 'task.1',
            text: 'Test Reference 1'
        }]
    });

    return new CanvasView({
        view: new Core.form.editors.DatalistEditor({
            model,
            key: 'DatalistValue',
            autocommit: true,
            showEditButton: true,
            showAddNewButton: true,
            showCheckboxes: true,
            maxQuantitySelected: 5,
            controller: new Core.form.editors.reference.controllers.DemoReferenceEditorController()
        }),
        presentation: "[ {{#each DatalistValue}}<div>{ id: '{{this.id}}', text: '{{this.text}}' }{{#unless @last}}, {{/unless}}</div>{{/each}} <div>]</div>",
        isEditor: true
    });
}
