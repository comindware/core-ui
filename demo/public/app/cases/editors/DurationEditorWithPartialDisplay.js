define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
        const model = new Backbone.Model({
            durationValue: 'P3DT3H4M'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.DurationEditor({
                model,
                key: 'durationValue',
                autocommit: true,
                allowDays: false
            }),
            presentation: "{{#isNull durationValue}}null{{else}}'{{durationValue}}'{{/isNull}}"
        });
    };
});
