
import core from 'comindware/core';

const model = new Backbone.Model({
    title: 'foo',
    idealDays: 'bar',
    dueDate: '123',
    description: '2015-07-20T10:46:37Z',
    blocked: true
});

export default core.View.createView({
    model,
    schema: [{
        type: 'v-container',
        items: [{
            type: 'Text-editor',
            key: 'title'
        }, {
            type: 'TextArea-editor',
            key: 'idealDays'
        }, {
            type: 'Number-editor',
            key: 'dueDate'
        }, {
            type: 'DateTime-editor',
            key: 'description'
        }, {
            type: 'Boolean-editor',
            key: 'blocked',
            displayText: 'Make me some tea!'
        }]
    }]
});
