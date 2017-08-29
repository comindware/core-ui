define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
        const possibleItems = _.times(200, n => ({
            id: n + 1,
            text: `Text ${n + 1}`
        }));

        const model = new Backbone.Model({
            dropdownValue: 42
        });

        return new EditorCanvasView({
            editor: new core.form.editors.DropdownEditor({
                model,
                key: 'dropdownValue',
                autocommit: true,
                collection: new Backbone.Collection(possibleItems),
                enableSearch: true
            }),
            presentation: '{{dropdownValue}}'
        });
    };
});
