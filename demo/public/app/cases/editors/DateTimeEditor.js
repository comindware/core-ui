
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default EditorCanvasView({
    editor: new core.form.editors.DateTimeEditor({
        model: new Backbone.Model({
            dateTimeValue: '2015-07-20T10:46:37Z'
        }),
        key: 'dateTimeValue',
        autocommit: true
    }),
    presentation: "{{#isNull dateTimeValue}}null{{else}}'{{dateTimeValue}}'{{/isNull}}"
});
