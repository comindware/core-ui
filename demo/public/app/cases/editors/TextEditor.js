define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
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
    };
});
