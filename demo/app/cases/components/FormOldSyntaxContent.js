export default function() {
    return new Core.layout.Form({
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
        schema: {
            1 :{
                type: 'Text',
                class: 'my-awsome__class',
            },
            2 : {
                type: 'TextArea'
            },
            3 :{
                type: 'Number'
            },
            4: {
                type: 'DateTime'
            },
            5: {
                type: 'Boolean',
                displayText: 'Make me some tea!'
            }
        },
        content: new Core.layout.VerticalLayout({
            rows: [
                new Core.layout.HorizontalLayout({
                    columns: [
                        new Core.layout.PlainText({
                            text: 'nodeColorName'
                        }),
                        Core.layout.createFieldAnchor('1'),
                        Core.layout.createFieldAnchor('4'),
                        Core.layout.createFieldAnchor('5')
                    ]
                }),
                new Core.layout.HorizontalLayout({
                    columns: [
                        new Core.layout.PlainText({
                            text: 'nodeBcgColorName'
                        }),
                        Core.layout.createFieldAnchor('2'),
                        Core.layout.createFieldAnchor('3')
                    ]
                })
            ]
        })
    });
}
