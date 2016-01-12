define(['comindware/core', 'demoPage/views/EditorCanvasView'],
    function (core, EditorCanvasView) {
        'use strict';
        return function () {
            var model = new Backbone.Model({
                passwordValue: ''
            });

            return new EditorCanvasView({
                editor: new core.form.editors.PasswordEditor({
                    model: model,
                    key: 'passwordValue',
                    autocommit: true
                }),
                presentation: "'{{passwordValue}}'"
            });
        }
    });
