import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    return new CanvasView({
        view: new core.form.editors.PasswordEditor({
            model: new Backbone.Model({
                passwordValue: ''
            }),
            key: 'passwordValue',
            autocommit: true
        }),
        presentation: "'{{passwordValue}}'"
    });
}
