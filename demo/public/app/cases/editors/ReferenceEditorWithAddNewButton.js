define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';

    var model = new Backbone.Model({
        referenceValue: {
            id: 'test.1',
            text: 'Test Reference 1'
        }
    });

    return function () {
        return new EditorCanvasView({
            editor: new core.form.editors.ReferenceEditor({
                model: model,
                key: 'referenceValue',
                autocommit: true,
                controller: new (core.form.editors.reference.controllers.DemoReferenceEditorController.extend({
                    addNewItem:function(){
                        alert('Added');
                    }
                })),
                showAddNewButton: true
            }),
            presentation: "{ id: '{{referenceValue.attributes.id}}', text: '{{referenceValue.attributes.text}}' }"
        });
    };
});
