define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            referenceValue: {
                id: 'test.1',
                text: 'Test Reference 1'
            }
        });

        return new EditorCanvasView({
            editor: new core.form.editors.ReferenceEditor({
                model: model,
                key: 'referenceValue',
                autocommit: true,
                controller: new core.form.editors.reference.controllers.DemoReferenceEditorController()
            }),
            presentation: "{{#if referenceValue}}{ id: '{{referenceValue.id}}', text: '{{referenceValue.text}}' }{{else}}null{{/if}}"
        });
    };
});
