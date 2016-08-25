define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            textValue: 'Some text'
        });

        return new EditorCanvasView({
            editor:new core.form.editors.TextEditor({
                model: model,
                key: 'textValue',
                changeMode: 'keydown',
                autocommit: true
            }),
            presentation: '\'{{textValue}}\''
        });
    };
});
