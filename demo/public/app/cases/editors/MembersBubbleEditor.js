
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        membersValue: [ 'user.1' ]
    });

    return new CanvasView({
        view: new core.form.editors.MembersBubbleEditor({
            model,
            key: 'membersValue',
            maxQuantitySelected: 7,
            autocommit: true
        }),
        presentation: '[ {{#each membersValue}}\'{{this}}\'{{#unless @last}}, {{/unless}}{{/each}} ]'
    });
}
