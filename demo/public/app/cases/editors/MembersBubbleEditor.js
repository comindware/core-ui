define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            membersValue: [ 'user.1' ]
        });

        return new EditorCanvasView({
            editor: new core.form.editors.MembersBubbleEditor({
                model: model,
                key: 'membersValue',
                maxQuantitySelected: 7,
                autocommit: true
            }),
            presentation: '[ {{#each membersValue}}\'{{this}}\'{{#unless @last}}, {{/unless}}{{/each}} ]'
        });
    };
});
