export default function() {
    const model = new Backbone.Model({
        name: '',
        dueDate: '2015-07-20T10:46:37Z',
        description: 'no-op',
        computed: false,
        ref: []
    });

    const formSchema = {
        name: {
            title: 'Name',
            type: 'Text',
            autocommit: true,
            required: true,
            validators: ['required']
        },
        idealDays: {
            title: 'Ideal Days',
            type: 'Number',
            autocommit: true,
            required: true,
            validators: ['required']
        },
        dueDate: {
            title: 'Due Date',
            type: 'DateTime'
        },
        description: {
            title: 'Description',
            type: 'TextArea'
        },
        computed: {
            type: 'Boolean',
            displayText: 'Computed via expression'
        },
        expression: {
            type: 'Code',
            title: 'Expression',
            autocommit: true,
            required: true,
            validators: ['required']
        },
        ref: {
            type: 'Datalist',
            title: 'Datalist',
            autocommit: true,
            collection: new Backbone.Collection(),
            required: true,
            validators: ['required']
        }
    };

    const createPopup = () =>
        new Core.layout.Popup({
            size: {
                width: '800px',
                height: '700px'
            },
            newTabUrl: '#', //array with arguments or single url for window.open
            header: 'New Operation',
            buttons: [
                {
                    id: false,
                    text: 'Cancel',
                    customClass: 'btn-small btn-outline',
                    handler() {
                        Core.services.WindowService.closePopup();
                    }
                },
                {
                    id: true,
                    text: 'Save',
                    customClass: 'btn-small',
                    handler(popup) {
                        const error = popup.validate();
                        if (error) {
                            return;
                        }
                        popup.setLoading(true);
                        setTimeout(() => {
                            popup.setLoading(false);
                            popup.content.form.commit();
                            Core.services.WindowService.closePopup();
                            alert(JSON.stringify(model.toJSON(), null, 4));
                        }, 1000);
                    }
                }
            ],
            content: new Core.layout.Form({
                model,
                schema: formSchema,
                transliteratedFields: {
                    description: 'name'
                },
                content: new Core.layout.TabLayout({
                    tabs: [
                        {
                            id: 'general',
                            name: 'General',
                            view: new Core.layout.VerticalLayout({
                                rows: [
                                    Core.layout.createFieldAnchor('name'),
                                    new Core.layout.HorizontalLayout({
                                        columns: [Core.layout.createFieldAnchor('idealDays'), Core.layout.createFieldAnchor('dueDate')]
                                    }),
                                    Core.layout.createFieldAnchor('description'),
                                    Core.layout.createEditorAnchor('computed')
                                ]
                            })
                        },
                        {
                            id: 'expression',
                            name: 'Computed Expression',
                            view: Core.layout.createFieldAnchor('expression')
                        },
                        {
                            id: 'ref',
                            name: 'Datalist editor',
                            view: Core.layout.createFieldAnchor('ref')
                        },
                        {
                            id: 'poup',
                            name: 'Datalist editor',
                            view: new (Marionette.View.extend({
                                template: Handlebars.compile('<input class="js-show-popup" type="button" value="Show Popup" />'),

                                events: {
                                    'click .js-show-popup'() {
                                        Core.services.WindowService.showPopup(createPopup());
                                    }
                                }
                            }))()
                        }
                    ]
                })
            })
        });

    const View = Marionette.View.extend({
        template: Handlebars.compile('<input class="js-show-popup" type="button" value="Show Popup" />'),

        events: {
            'click .js-show-popup'() {
                Core.services.WindowService.showPopup(createPopup());
            }
        }
    });

    return new View();
}
