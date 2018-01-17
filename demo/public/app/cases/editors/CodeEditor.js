
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        code: 'true'
    });

    return new CanvasView({
        view: new core.form.editors.CodeEditor({
            model,
            key: 'code',
            autocommit: true,
            mode: 'code'
        }),
        presentation: "'{{code}}'"
    });
}
