export default function() {
    return new Core.layout.VerticalLayout({
        rows: [
            new Core.form.editors.DatalistEditor({
                name: 'Say hello!',
                collection: new Backbone.Collection([
                    {
                        id: '1',
                        name: 'Item 1'
                    },
                    {
                        id: '2',
                        name: 'Other Item'
                    },
                    {
                        id: '3',
                        name: 'Text'
                    },
                    {
                        id: '4',
                        name: 'Long long long long long Item'
                    }
                ])
            })
        ]
    });
}
