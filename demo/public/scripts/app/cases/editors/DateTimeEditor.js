define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            dateTimeValue: '2015-07-20T10:46:37Z'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.DateTimeEditor({
                model: model,
                key: 'dateTimeValue',
                autocommit: true,
                enableDelete: true,
                timezoneOffset: -60 // minutes
            }),
            presentation: "{{#isNull dateTimeValue}}null{{else}}'{{dateTimeValue}}'{{/isNull}}"
        });
    };
});
