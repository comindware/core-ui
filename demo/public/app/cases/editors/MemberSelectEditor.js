define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            memberValue: 'cmw.account.admin'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.MemberSelectEditor({
                model: model,
                key: 'memberValue',
                autocommit: true
            }),
            presentation: '\'{{memberValue}}\''
        });
    };
});
