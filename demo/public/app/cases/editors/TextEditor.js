import CanvasView from 'demoPage/views/CanvasView';

export default function(options) {
    const model = new Backbone.Model(
        options
            ? options.attributes
            : {
                  textValue: 'Some text'
              }
    );

    return new CanvasView({
        view: new Core.form.editors.TextEditor(
            Object.assign(
                {
                    model,
                    key: 'textValue'
                },
                options ? options.schema : {}
            )
        ),
        presentation: "'{{textValue}}'",
        isEditor: true
    });
}
