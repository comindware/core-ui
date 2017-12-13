
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        value: 'Foo Bar'
    });

    return new EditorCanvasView({
        editor: new core.form.editors.AudioEditor({
            model,
            key: 'value'
        }),

        presentation: '"{{value}}"'
    });
}
