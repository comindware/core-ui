
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        textAreaValue: 'Some Text 1\r\nSome Text 2\r\nSome Text 3\r\nSome Text 4\r\nSome Text 5\r\nSome Text 6'
    });

    return new CanvasView({
        view: new Core.form.editors.TextAreaEditor({
            model,
            key: 'textAreaValue',
            changeMode: 'keydown',
            autocommit: true,
            maxHeight: 10
        }),
        presentation: '<div style="display: inline-block"><span style="color: darkgreen">{{{renderAsHtml textAreaValue}}}</span></div>',
        isEditor: true
    });
}
