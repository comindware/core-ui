
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        value: [{
            id: 'myLovelyDocument',
            name: 'My lovely document'
        }]
    });

    return new CanvasView({
        view: new core.form.editors.DocumentEditor({
            model,
            key: 'value',
            autocommit: true
        }),
        presentation: "'{{value}}'",
        isEditor: true
    });
}
