
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        value: null
    });

    return new EditorCanvasView({
        editor: new core.form.editors.DocumentEditor({
            model,
            key: 'value',
            autocommit: true
        }),
        presentation: "'{{value}}'"
    });
}
