export default function() {
    return new Core.layout.VerticalLayout({
        rows: [
            new Core.layout.Button({
                text: 'Leaving warnng',
                customClass: 'btn-large',
                handler() {
                    Core.services.MessageService.showSystemMessage({
                        type: 'unsavedChanges'
                    });
                }
            }),
            new Core.layout.Button({
                text: 'Generic message',
                customClass: 'btn-large',
                handler() {
                    Core.services.MessageService.showMessageDialog('My Message!', 'Title', [
                        {
                            text: 'firstT',
                            handler: () => {}
                        },
                        {
                            text: 'secondT',
                            handler: () => {}
                        }
                    ]);
                }
            })
        ]
    });
}
