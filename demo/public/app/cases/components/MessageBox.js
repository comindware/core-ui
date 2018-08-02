export default function() {
    return new core.layout.VerticalLayout({
        rows: [
            new core.layout.Button({
                text: 'Leaving warnng',
                customClass: 'btn-large',
                handler() {
                    Core.services.MessageService.showSystemMessage({
                        type: 'unsavedChanges'
                    });
                }
            }),
            new core.layout.Button({
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
