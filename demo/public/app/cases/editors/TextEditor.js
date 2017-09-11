
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        textValue: 'Some text'
    });

    return new EditorCanvasView({
        editor: new core.form.editors.TextEditor({
            model,
            key: 'textValue',
            changeMode: 'keydown',
            autocommit: true
        }),
        presentation: '\'{{textValue}}\''
    });
}
