import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    return new EditorCanvasView({
        editor: new core.form.editors.PasswordEditor({
            model: new Backbone.Model({
                passwordValue: ''
            }),
            key: 'passwordValue',
            autocommit: true
        }),
        presentation: "'{{passwordValue}}'"
    });
}
