import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        //avatar: '14167968',
        fullName: 'Foo Bar'
    });

    const view = new Core.form.editors.AvatarEditor({
        model,
        key: 'avatar',
        autocommit: true,
        fullName: model.get('fullName'),
        autoUpload: true, // or use method 'upload' instead
        refreshPreviewAfterUpload: true,
        controller: new Core.form.editors.avatar.controllers.DemoAvatarEditorController({
            defaultURL: ''
        })
    });

    return new CanvasView({
        view,
        presentation: '"{{avatar}}"',
        isEditor: true
    });
}
