import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        booleanValue: [1]
    });

    return new CanvasView({
        view: new Core.form.editors.BooleanGroupEditor({
            model,
            key: 'booleanValue',
            changeMode: 'keydown',
            autocommit: true,
            title: 'Some',
            items: [{ id: 1, displayText: 'First choice' }, { id: 2, displayText: 'Second choice' }, { id: 3, displayText: 'Third choice' }]
        }),
        presentation: "[ {{#each booleanValue}}<div>'{{this}}'</div>{{/each}} <div>]</div>",
        isEditor: true
    });
}
