define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    const model = new Backbone.Model({
        referenceValue: {
            id: 'test.1',
            text: 'Test Reference 1'
        }
    });

    return function() {
        return new EditorCanvasView({
            editor: new core.form.editors.ReferenceEditor({
                model,
                key: 'referenceValue',
                autocommit: true,
                controller: new (core.form.editors.reference.controllers.DemoReferenceEditorController.extend({
                    addNewItem(callback) {
                        alert('Added');
                        callback({
                            id: 'test.new',
                            text: 'New Item'
                        });
                    }
                }))(),
                showAddNewButton: true
            }),
            presentation: "{{#if referenceValue}}{ id: '{{referenceValue.id}}', text: '{{referenceValue.text}}' }{{else}}null{{/if}}"
        });
    };
});
