define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';

    return function () {
        return new EditorCanvasView({
            editor: new core.form.editors.ReferenceEditor({
                model: new Backbone.Model(),
                key: 'referenceValue',
                autocommit: true,
                controller: new core.form.editors.reference.controllers.DemoReferenceEditorWithAddNewButtonController(),
                showAddNewButton: true
            }),
            presentation: "{ id: '{{referenceValue.attributes.id}}', text: '{{referenceValue.attributes.text}}' }"
        });
    };
});
