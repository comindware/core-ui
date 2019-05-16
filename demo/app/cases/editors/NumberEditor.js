

import CanvasView from 'demoPage/views/CanvasView';

export default function () {
    const model = new Backbone.Model({
        numberValue: 42
    });

    return new CanvasView({
        view: new Core.form.editors.NumberEditor({
            model,
            key: 'numberValue',
            changeMode: 'keydown',
            autocommit: true,
            min: -300,
            allowFloat: true,
            max: 300,
            step: 3,
            intlOptions: {
                useGrouping: true,
                maximumFractionDigits: 3
            }
        }),
        presentation: '{{numberValue}}',
        isEditor: true
    });
}
