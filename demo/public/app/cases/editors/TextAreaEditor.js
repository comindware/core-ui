define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
        const model = new Backbone.Model({
            textAreaValue: 'Some Text 1\r\nSome Text 2\r\nSome Text 3\r\nSome Text 4\r\nSome Text 5\r\nSome Text 6'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.TextAreaEditor({
                model,
                key: 'textAreaValue',
                changeMode: 'keydown',
                autocommit: true,
                maxHeight: 10
            }),
            presentation: '<div style="display: inline-block"><span style="color: darkgreen">{{{renderAsHtml textAreaValue}}}</span></div>'
        });
    };
});
