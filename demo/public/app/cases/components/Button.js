

export default function() {
    return new Core.layout.VerticalLayout({
        rows: [
            new Core.form.editors.TextEditor({
                value: 'foo'
            }),
            new Core.layout.HorizontalLayout({
                columns: [
                    new Core.form.editors.NumberEditor({
                        value: 123
                    }),
                    new Core.form.editors.DateTimeEditor({
                        value: '2015-07-20T10:46:37Z'
                    })
                ]
            }),
            new Core.form.editors.TextAreaEditor({
                value: 'bar\nbaz'
            }),
            new Core.form.editors.BooleanEditor({
                value: true,
                displayText: 'Make me some tea!'
            }),
            new Core.layout.Button({
                text: 'Say hello!',
                iconClass: 'plus',
                handler() {
                    alert('Hello!');
                }
            })
        ]
    });
}
