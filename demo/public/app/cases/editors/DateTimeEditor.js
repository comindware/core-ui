

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    return new CanvasView({
        view: new core.form.editors.DateTimeEditor({
            model: new Backbone.Model({
                dateTimeValue: '2015-07-20T10:46:37Z'
            }),
            key: 'dateTimeValue',
            autocommit: true
        }),
        presentation: "{{#isNull dateTimeValue}}null{{else}}'{{dateTimeValue}}'{{/isNull}}",
        isEditor: true
    });
}
