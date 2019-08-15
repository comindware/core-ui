export default function() {
    const model = new Backbone.Model({
        title: 'foo',
        idealDays: 12,
        dueDate: '2015-07-20T10:46:37Z',
        description: 'bar\nbaz',
        blocked: true
    });

    const view = new Core.layout.Form({
        model,
        schema: [
            {
                cType: 'container',
                layout: 'vertical',
                items: [
                    {
                        cType: 'field',
                        key: 'title',
                        title: 'Title',
                        type: 'Text'
                    },
                    {
                        cType: 'container',
                        layout: 'horizontal',
                        items: [
                            {
                                cType: 'field',
                                key: 'idealDays',
                                title: 'Ideal Days',

                                type: 'Number'
                            },
                            {
                                cType: 'field',
                                key: 'dueDate',
                                type: 'DateTime',
                                title: 'Due Date'
                            }
                        ]
                    },
                    {
                        cType: 'field',
                        key: 'description',
                        title: 'Description',
                        type: 'TextArea'
                    },
                    {
                        cType: 'field',
                        key: 'blocked',
                        type: 'Boolean',
                        displayText: 'Blocked by another task'
                    },
                    {
                        text: 'Commit',
                        cType: 'Button',
                        handler() {
                            view.form.commit();
                            alert(JSON.stringify(model.toJSON(), null, 4));
                        }
                    }
                ]
            }
        ]
    });

    return view;
}
