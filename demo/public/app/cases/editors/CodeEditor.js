import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const editorView = new Core.form.Field({
        model: new Backbone.Model({
            code: 'true'
        }),
        schema: {
            type: 'Code',
            title: 'Code editor',
            required: true,
            validators: ['code'],
            autocommit: true,
            changeMode: 'keydown',
            helpText: 'Code validation',
            mode: 'script'
        },
        key: 'code'
    });

    editorView.validate();

    return new CanvasView({
        view: editorView,
        presentation: "'{{code}}'",
        isEditor: true
    });
}
