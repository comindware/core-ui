define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            booleanValue: true
        });

        return new EditorCanvasView({
            editor: new core.form.editors.BooleanEditor({
                model: model,
                key: 'booleanValue',
                changeMode: 'keydown',
                autocommit: true,
                displayText: 'Some Text'
            }),
            presentation: '{{#if booleanValue}}true{{else}}false{{/if}}'
        });
    };
});
