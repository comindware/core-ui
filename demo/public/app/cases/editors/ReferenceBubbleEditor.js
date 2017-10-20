import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        referenceBubbleValue: [{
            id: 'test.1',
            text: 'Test Reference 1'
        }]
    });

    return new EditorCanvasView({
        editor: new core.form.editors.ReferenceBubbleEditor({
            model,
            key: 'referenceBubbleValue',
            autocommit: true,
            showEditButton: false,
            controller: new core.form.editors.reference.controllers.DemoReferenceEditorController()
        }),
        presentation: "[ {{#each referenceBubbleValue}}{ id: '{{this.id}}', text: '{{this.text}}' }{{#unless @last}}, {{/unless}}{{/each}} ]"
    });
}

