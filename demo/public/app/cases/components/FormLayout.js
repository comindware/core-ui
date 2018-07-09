export default function() {
    return new core.layout.Form({
        model: new Backbone.Model({
            1: 'text',
            2: 123,
            3: 'foo',
            4: '2015-07-20T10:46:37Z',
            5: true,
            6: 'aaa',
            7: 456,
            8: '2015-07-20T10:46:37Z',
            9: 'dddddddddddddd',
            10: 789,
            11: new Backbone.Collection([{}, {}])
        }),
        schema: [
            {
                type: 'v-container',
                items: [
                    {
                        type: 'plainText',
                        class: 'my-awsome__class',
                        text: '<div style="background-color:red;"></div>'
                    },
                    {
                        type: 'Text-editor',
                        class: 'my-awsome__class',
                        key: 1
                    },
                    {
                        type: 'TextArea-editor',
                        key: 2
                    },
                    {
                        type: 'Number-editor',
                        key: 3
                    },
                    {
                        type: 'DateTime-editor',
                        key: 4
                    },
                    {
                        type: 'Boolean-editor',
                        key: 5,
                        displayText: 'Make me some tea!'
                    },
                    {
                        type: 'h-container',
                        items: [
                            {
                                type: 'Text-editor',
                                key: 6
                            },
                            {
                                type: 'v-container',
                                items: [
                                    {
                                        type: 'Number-editor',
                                        key: 7
                                    },
                                    {
                                        type: 'DateTime-editor',
                                        key: 8
                                    }
                                ]
                            },
                            {
                                type: 'TextArea-editor',
                                key: 9
                            },
                            {
                                type: 'Number-editor',
                                key: 10
                            }
                        ]
                    },
                    {
                        type: 'grid',
                        class: 'my-custon__class',
                        columns: [
                            {
                                key: '11',
                                dataType: 'String',
                                title: 'My awsome column'
                            }
                        ],
                        collection: new Backbone.Collection([{}, {}, {}, {}, {}, {}]),
                        key: 11
                    }
                ]
            }
        ]
    });
}
