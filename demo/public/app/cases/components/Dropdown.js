export default function() {
    return new core.layout.VerticalLayout({
        rows: [
            new core.form.editors.DatalistEditor({
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
