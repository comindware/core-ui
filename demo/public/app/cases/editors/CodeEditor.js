import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        code: 'true'
    });

    return new EditorCanvasView({
        editor: new core.form.editors.CodeEditor({
            model,
            key: 'code',
            autocommit: true,
            mode: 'code'
        }),
        presentation: "{{#isNull timeValue}}null{{else}}'{{timeValue}}'{{/isNull}}"
    });
};