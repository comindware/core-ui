define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
        const model = new Backbone.Model({
            booleanValue: true
        });

        return new EditorCanvasView({
            editor: new core.form.editors.BooleanEditor({
                model,
                key: 'booleanValue',
                changeMode: 'keydown',
                autocommit: true,
                displayText: 'Some Text'
            }),
            presentation: '{{#if booleanValue}}true{{else}}false{{/if}}'
        });
    };
});
