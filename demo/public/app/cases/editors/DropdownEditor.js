
import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const possibleItems = _.times(200, n => ({
        id: n + 1,
        text: `Text ${n + 1}`,
        subtext: `subtext ${n + 1}`
    }));

    const model = new Backbone.Model({
        dropdownValue: 42
    });

    return new EditorCanvasView({
        editor: new core.form.editors.ReferenceBubbleEditor({
            model,
            key: 'dropdownValue',
            autocommit: true,
            collection: new Backbone.Collection(possibleItems),
            enableSearch: true
        }),
        presentation: '{{dropdownValue}}'
    });
}
