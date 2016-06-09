define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var possibleItems = _.times(200, function (n) {
            return {
                id: n + 1,
                text: 'Text ' + (n + 1)
            };
        });

        var model = new Backbone.Model({
            dropdownValue: 42
        });

        return new EditorCanvasView({
            editor: new core.form.editors.DropdownEditor({
                model: model,
                key: 'dropdownValue',
                autocommit: true,
                collection: new Backbone.Collection(possibleItems),
                enableSearch: true
            }),
            presentation: "{{dropdownValue}}"
        });
    };
});
