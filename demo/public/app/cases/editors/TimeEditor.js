

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        timeValue: '2015-07-20T10:46:37Z'
    });

    return new CanvasView({
        view: new Core.form.editors.TimeEditor({
            model,
            key: 'timeValue',
            autocommit: true
        }),
        presentation: "{{timeValue}}",
        isEditor: true
    });
}
