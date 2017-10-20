
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        dateValue: '2015-07-20T00:00:00Z'
    });

    return new EditorCanvasView({
        editor: new core.form.editors.DateEditor({
            model,
            key: 'dateValue',
            autocommit: true
        }),
        presentation: "{{#isNull dateValue}}null{{else}}'{{dateValue}}'{{/isNull}}"
    });
}
