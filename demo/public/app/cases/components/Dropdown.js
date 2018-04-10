import core from 'comindware/core';

export default function() {
    return new core.layout.VerticalLayout({
        rows: [
            new core.form.editors.DatalistEditor({
                name: 'Say hello!',
                collection: new Backbone.Collection([
                    {
                        id: '1',
                        name: 1
                    },
                    {
                        id: '2',
                        name: 2
                    },
                    {
                        id: '3',
                        name: 3
                    },
                    {
                        id: '4',
                        name: 4
                    }
                ])
            })
        ]
    });
}
