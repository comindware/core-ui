
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        value: [
            {
                id: 'document.1',
                name: 'Document 1',
                url: 'GetDocument/1'
            },
            {
                id: 'document.2',
                name: 'Document 1',
                url: 'GetDocument/1'
            },
            {
                id: 'document.3',
                name: 'Document 1',
                url: 'GetDocument/1'
            },
            {
                id: 'document.4',
                name: 'Document 1',
                url: 'GetDocument/1'
            },
            {
                id: 'document.5',
                name: 'Document 1',
                url: 'GetDocument/1'
            },
            {
                id: 'document.6',
                name: 'Document 1',
                url: 'GetDocument/1'
            }
        ]
    });

    return new CanvasView({
        view: new core.form.editors.DocumentEditor({
            model,
            key: 'value',
            autocommit: true,
            displayText: 'Document Editor'
        }),
        presentation: "'{{value}}'",
        isEditor: true
    });
}
