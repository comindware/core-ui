
import core from 'comindware/core';

const model = new Backbone.Model({
    title: 'foo',
    idealDays: 12,
    dueDate: '2015-07-20T10:46:37Z',
    description: 'bar\nbaz',
    blocked: true
});

export default class View {
    constructor() {
        return new core.View({
            model,
            schema: [{
                type: 'h-container',
                breakpoints: {
                    'max-width: 499px': {
                        'flex-direction': 'column'
                    },
                    'min-width: 500px': {
                        'flex-direction': 'row'
                    }
                },
                items: [{
                    type: 'Text-field',
                    key: 'title'
                }, {
                    type: 'h-container',
                    items: [{
                        type: 'Number-field',
                        key: 'idealDays'
                    }, {
                        type: 'DateTime-field',
                        key: 'dueDate'
                    }]
                }, {
                    type: 'TextArea-field',
                    key: 'description'
                }, {
                    type: 'Boolean-field',
                    key: 'blocked'
                }, {
                    type: 'button',
                    text: 'Commit',
                    handler() {
                        this.form.commit();
                    }
                }]
            }]
        });
    }
}
