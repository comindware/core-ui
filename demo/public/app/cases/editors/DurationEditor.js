
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        durationValue: 'P3DT3H4M'
    });

    return new CanvasView({
        view: new core.form.editors.DurationEditor({
            model,
            key: 'durationValue',
            autocommit: true
        }),
        presentation: "{{#isNull durationValue}}null{{else}}'{{durationValue}}'{{/isNull}}",
        isEditor: true
    });
}
