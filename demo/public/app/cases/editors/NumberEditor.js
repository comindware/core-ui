define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
        const model = new Backbone.Model({
            numberValue: 42
        });

        return new EditorCanvasView({
            editor: new core.form.editors.NumberEditor({
                model,
                key: 'numberValue',
                changeMode: 'keydown',
                autocommit: true,
                min: null,
                max: null,
                allowFloat: true
            }),
            presentation: '{{numberValue}}'
        });
    };
});
