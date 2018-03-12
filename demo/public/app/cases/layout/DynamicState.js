import core from 'comindware/core';

export default function() {
    const model = new Backbone.Model({
        title: 'New Task',
        idealDays: 12,
        dueDate: '2015-07-20T10:46:37Z',
        blocked: false,
        blockReason: 'Describe how it happened...',
        description: 'bar\nbaz'
    });

    const formSchema = {
        title: {
            title: 'Title',
            type: 'Text'
        },
        idealDays: {
            title: 'Ideal Days',
            type: 'Number'
        },
        dueDate: {
            title: 'Due Date',
            type: 'DateTime'
        },
        blocked: {
            type: 'Boolean',
            displayText: 'Blocked by another task (PRESS ME!)'
        },
        blockReason: {
            title: 'Block Reason',
            type: 'TextArea'
        },
        description: {
            title: 'Description',
            type: 'TextArea'
        }
    };

    const view = new core.layout.Form({
        model,
        schema: formSchema,
        content: new core.layout.VerticalLayout({
            rows: [
                core.layout.createFieldAnchor('title'),
                new core.layout.HorizontalLayout({
                    columns: [
                        core.layout.createFieldAnchor('idealDays'),
                        core.layout.createFieldAnchor('dueDate')
                    ]
                }),
                core.layout.createEditorAnchor('blocked'),
                core.layout.createFieldAnchor('blockReason', {
                    visible: () => view.getValue('blocked')
                }),
                core.layout.createFieldAnchor('description'),
                new core.layout.Button({
                    text: 'Commit',
                    handler() {
                        view.form.commit();
                        alert(JSON.stringify(model.toJSON(), null, 4));
                    }
                })
            ]
        })
    });

    view.once('form:render', () => {
        view.form.on('change', () => {
            view.content.update();
        });
    });

    return view;
}
