import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    return new CanvasView({
        view: new Core.layout.Group({
            name: 'Group',
            collapsible: true,
            showMenu: true,
            view: new Core.layout.Group({
                name: 'Nested Group',
                collapsible: false,
                showMenu: true,
                view: new Core.layout.VerticalLayout({
                    rows: [
                        new Core.form.editors.TextEditor({
                            value: 'foo'
                        }),
                        new Core.form.editors.TextAreaEditor({
                            value: 'bar'
                        }),
                        new Core.form.editors.NumberEditor({
                            value: 123
                        }),
                        new Core.form.editors.DateTimeEditor({
                            value: '2015-07-20T10:46:37Z'
                        }),
                        new Core.form.editors.BooleanEditor({
                            value: true,
                            displayText: 'Make me some tea!'
                        })
                    ]
                })
            })
        }),
        canvas: {
            width: '500px'
        }
    });
}
