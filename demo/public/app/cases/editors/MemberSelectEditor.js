define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
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
    };
});
