

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        value: '5'
    });

    return new CanvasView({
        view: new Core.form.editors.RangeEditor({
            model,
            key: 'value',
            autocommit: true,
            min: 1,
            max: 10,
            step: 1
        }),
        presentation: "'{{value}}'",
        isEditor: true
    });
}
