
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        textValue: 'Some text'
    });

    return new CanvasView({
        view: new Core.form.editors.TextEditor({
            model,
            key: 'textValue',
            changeMode: 'keydown',
            autocommit: true
        }),
        presentation: '\'{{textValue}}\'',
        isEditor: true
    });
}
