define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            numberValue: 42
        });

        return new EditorCanvasView({
            editor: new core.form.editors.NumberEditor({
                model: model,
                key: 'numberValue',
                changeMode: 'keydown',
                autocommit: true,
                min: null,
                max: null,
                allowFloat: true,
                format: null
            }),
            presentation: '{{numberValue}}'
        });
    };
});
