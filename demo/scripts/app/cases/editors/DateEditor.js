define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            dateValue: '2015-07-20T00:00:00Z'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.DateEditor({
                model: model,
                key: 'dateValue',
                autocommit: true
            }),
            presentation: "'{{dateValue}}'"
        });
    };
});
