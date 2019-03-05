import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        booleanValue: true
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
        isEditor: true
    });
}
