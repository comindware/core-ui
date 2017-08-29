define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], (core, EditorCanvasView) => {
    'use strict';

    return function() {
        const model = new Backbone.Model({
            membersValue: [ 'user.1' ]
        });

        return new EditorCanvasView({
            editor: new core.form.editors.MembersBubbleEditor({
                model,
                key: 'membersValue',
                maxQuantitySelected: 7,
                autocommit: true
            }),
            presentation: '[ {{#each membersValue}}\'{{this}}\'{{#unless @last}}, {{/unless}}{{/each}} ]'
        });
    };
});
