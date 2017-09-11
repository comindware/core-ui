
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const selectableItems = _.times(10, index => ({
        id: index + 1,
        text: `Item ${index + 1}`
    }));

    const model = new Backbone.Model({
        multiValue: [0, 2, 4, 6, 8, 10, 100]
    });

    const editor = new core.form.editors.MultiSelectEditor({
        model,
        key: 'multiValue',
        autocommit: true,
        collection: new Backbone.Collection(selectableItems),
        allowEmptyValue: false,
        explicitApply: true
    });

    return new EditorCanvasView({
        editor,
        presentation: '{{#if multiValue}}[{{multiValue}}]{{else}}null{{/if}}'
    });
}
