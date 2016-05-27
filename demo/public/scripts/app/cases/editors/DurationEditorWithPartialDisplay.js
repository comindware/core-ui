define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            durationValue: 'P3DT3H4M'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.DurationEditor({
                model: model,
                key: 'durationValue',
                autocommit: true,
                allowDays: false
            }),
            presentation: "{{#isNull durationValue}}null{{else}}'{{durationValue}}'{{/isNull}}"
        });
    };
});
