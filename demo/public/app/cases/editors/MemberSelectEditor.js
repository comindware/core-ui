import core from 'comindware/core';
import EditorCanvasView from 'demoPage/views/EditorCanvasView';

export default function() {
    const model = new Backbone.Model({
        memberValue: 'user.1'
    });

    return new EditorCanvasView({
        editor: new core.form.editors.MemberSelectEditor({
            model,
            key: 'memberValue',
            autocommit: true
        }),
        presentation: '\'{{memberValue}}\''
    });
}
