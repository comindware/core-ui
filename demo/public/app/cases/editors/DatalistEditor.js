

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        DatalistValue: [{
            id: 'task.1',
            text: 'Test Reference 1'
        }]
    });

    const createDemoData = function () {
        return _.times(1000, i => {
            const id = `task.${i}`;
            return {
                id,
                text: `Test Reference ${i}`
            };
        });
    };

    const collection = new Core.form.editors.reference.collections.DemoReferenceCollection(createDemoData());

    return new CanvasView({
        view: new Core.form.editors.DatalistEditor({
            model,
            key: 'DatalistValue',
            autocommit: true,
            showCheckboxes: true,
            maxQuantitySelected: 5,
            fetchFiltered: true,
            collection
        }),
        presentation: "[ {{#each DatalistValue}}<div>{ id: '{{this.id}}', text: '{{this.text}}' }{{#unless @last}}, {{/unless}}</div>{{/each}} <div>]</div>",
        isEditor: true
    });
}
