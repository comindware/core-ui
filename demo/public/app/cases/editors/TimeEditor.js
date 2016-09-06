define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            timeValue: '2015-07-20T10:46:37Z'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.TimeEditor({
                model: model,
                key: 'timeValue',
                autocommit: true,
                timeDisplayFormat: null
            }),
            presentation: "{{#isNull timeValue}}null{{else}}'{{timeValue}}'{{/isNull}}"
        });
    };
});
