
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        value: [
            {
                id: 'document.1',
                name: 'Document 1',
                url: 'GetDocument/1'
            }
        ]
    });

    return new CanvasView({
        view: new core.form.editors.DocumentEditor({
            model,
            key: 'value',
            autocommit: true
        }),
        presentation: "'{{value}}'",
        isEditor: true
    });
}
