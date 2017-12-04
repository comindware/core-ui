
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        value: '5'
    });

    return new EditorCanvasView({
        editor: new core.form.editors.RangeEditor({
            model,
            key: 'value',
            autocommit: true,
            min: 1,
            max: 10,
            step: 1
        }),
        presentation: "'{{value}}'"
    });
}
