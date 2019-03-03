export default function() {
    const possibleItems = _.times(200, n => ({
        id: n,
        text: `Text ${n}`,
        subtext: `subtext ${n}`,
        contextIcon: n % 2 ? 'decimal' : 'text'
    }));

    const form = new Core.layout.Form({
        model: new Backbone.Model({
            0: 'edit me',
            1: 'text',
            2: '12_Мир ;Труд%,.Май64',
            dropdown: 3,
            3: 123,
            4: '2015-07-20T10:46:37Z',
            5: true,
            6: 'aaa',
            7: 456,
            8: '2015-07-20T10:46:37Z',
            9: 'dddddddddddddd',
            10: 789,
            11: new Backbone.Collection([{}, {}]),
            radio: 'value1'
        }),
        transliteratedFields: {
            2: '6'
        }, // transliteratedFields becomes required-like, and overwrite next property in schema { changeMode: 'blur', autocommit: true, forceCommit: true}
        schema: [
            {
                type: 'v-container',
                items: [
                    {
                        type: 'Text-field',
                        class: 'my-awsome__class',
                        text: '<div style="background-color:red;"></div>',
                        title: 'Required simple text',
                        validators: ['required'],
                        required: true,
                        key: 0,
                        autocommit: true
                    },
                    {
                        type: 'Text-editor',
                        class: 'my-awsome__class',
                        text: '<div style="background-color:red;"></div>',
                        title: 'Required simple text',
                        validators: ['required'],
                        required: true,
                        key: 1,
                        autocommit: true
                    },
                    {
                        type: 'TextArea-editor',
                        key: 2
                    },
                    {
                        type: 'Datalist-editor',
                        key: 'dropdown',
                        valueType: 'id',
                        collection: possibleItems
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
                                    },
                                    {
                                        type: 'RadioGroup-field',
                                        key: 'radio',
                                        changeMode: 'keydown',
                                        autocommit: true,
                                        radioOptions: [
                                            { id: 'value1', displayText: 'Some Text 1' },
                                            { id: 'value2', displayText: 'Some Text 2' },
                                            { id: 'value3', displayText: 'Some Text 3' }
                                        ]
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
                        class: 'my-custom__class',
                        columns: [
                            {
                                key: '11',
                                dataType: 'String',
                                title: 'My awesome column'
                            }
                        ],
                        collection: new Backbone.Collection([{}, {}, {}, {}, {}, {}]),
                        key: 11
                    },
                    {
                        type: 'button',
                        text: 'Validate form',
                        iconClass: 'plus',
                        handler() {
                            form.validate();
                        }
                    }
                ]
            }
        ]
    });

    return form;
}
