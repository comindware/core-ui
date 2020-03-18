import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        durationValue: 'P3DT3H4M'
    });

    return new CanvasView({
        view: new Core.form.editors.DurationEditor({
            model,
            key: 'durationValue',
            autocommit: true,
            showEmptyParts: true,
            max: 'P15DT18H4M',
            min: 3600000 //1 hour
        }),
        presentation: '{{durationValue}}',
        isEditor: true
    });
}
