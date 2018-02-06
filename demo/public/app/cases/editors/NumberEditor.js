
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        numberValue: 42
    });

    return new CanvasView({
        view: new core.form.editors.NumberEditor({
            model,
            key: 'numberValue',
            changeMode: 'keydown',
            autocommit: true,
            min: null,
            max: null,
            allowFloat: true
        }),
        presentation: '{{numberValue}}',
        isEditor: true
    });
}
