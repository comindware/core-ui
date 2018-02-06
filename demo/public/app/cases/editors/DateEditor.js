
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        dateValue: '2015-07-20T00:00:00Z'
    });

    return new CanvasView({
        view: new core.form.editors.DateEditor({
            model,
            key: 'dateValue',
            autocommit: true
        }),
        presentation: "{{#isNull dateValue}}null{{else}}'{{dateValue}}'{{/isNull}}",
        isEditor: true
    });
}
