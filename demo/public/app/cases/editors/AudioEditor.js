
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        value: 'Foo Bar'
    });

    return new CanvasView({
        view: new core.form.editors.AudioEditor({
            model,
            key: 'value'
        }),

        presentation: '"{{value}}"',
        isEditor: true
    });
}
