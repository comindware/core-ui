export default function() {
    const model = new Backbone.Model({
        timeValue: '2015-07-20T10:46:37Z'
    });

    return new EditorCanvasView({
        editor: new core.form.editors.TimeEditor({
            model,
            key: 'timeValue',
            autocommit: true
        }),
        presentation: "{{#isNull timeValue}}null{{else}}'{{timeValue}}'{{/isNull}}"
    });
}
