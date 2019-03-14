import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        iconClass: 'user'
    });

    return new CanvasView({
        view: new Core.form.editors.IconEditor({
            modelIconProperty: 'iconClass',
            model
        }),

        presentation: '"{{iconClass}}"',
        isEditor: true
    });
}
