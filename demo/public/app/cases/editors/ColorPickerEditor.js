

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        value: null
    });

    return new CanvasView({
        view: new Core.form.editors.ColorPickerEditor({
            model,
            key: 'value',
            autocommit: true
        }),
        presentation: "'{{value}}'",
        isEditor: true
    });
}
