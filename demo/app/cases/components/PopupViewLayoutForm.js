export default function() {
    const model = new Backbone.Model({
        name: '',
        alias: 'МирТрудаМай62',
        login: '',
        properties: new Backbone.Collection(
            new Backbone.Collection({
                name: 'propName',
                alias: 'propAlias'
            })
        )
    });

    const createPopup = () =>
        new Core.layout.Popup({
            size: {
                width: '800px',
                height: '700px'
            },
            fullscreenToggleDisabled: true,
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
                transliteratedFields: {
                    name: 'alias'
                },
                schema: [
                    {
                        type: 'v-container',
                        items: [
                            {
                                type: 'h-container',
                                items: [
                                    {
                                        key: 'name',
                                        type: 'Text-field',
                                        title: 'Name',
                                        required: true,
                                        validators: ['required'],
                                        readonly: model.isEmpty()
                                    },
                                    {
                                        key: 'alias',
                                        type: 'Text-field',
                                        title: 'Alias',
                                        required: true,
                                        validators: ['required', 'systemName'],
                                        readonly: model.isEmpty()
                                    },
                                    {
                                        key: 'login',
                                        type: 'Text-field',
                                        helpText: Localizer.get('CORE.FORM.VALIDATION.LOGIN'),
                                        title: 'Login',
                                        required: true,
                                        validators: ['required', 'login'],
                                        readonly: model.isEmpty()
                                    }
                                ]
                            },
                            {
                                type: 'grid',
                                collection: model.get('properties'),
                                executeAction(actionModel, selected) {
                                    switch (actionModel.get('id')) {
                                        case 'add':
                                            console.log('add', selected);
                                            break;
                                        case 'delete':
                                            console.log('delete', selected);
                                            break;
                                        default:
                                            break;
                                    }
                                },
                                title: 'Grid',
                                showToolbar: true,
                                showCheckbox: true,
                                excludeActions: ['archive', 'unarchive'],
                                columns: [
                                    {
                                        key: 'name',
                                        type: 'Text',
                                        title: 'name',
                                        required: true,
                                        validators: ['required'],
                                        autocommit: true,
                                        editable: true
                                    },
                                    {
                                        key: 'alias',
                                        type: 'Text',
                                        title: 'systemName',
                                        helpText: 'help!',
                                        required: true,
                                        autocommit: true,
                                        validators: ['required', 'systemName'],
                                        editable: true
                                    },
                                    {
                                        key: 'type',
                                        type: 'Datalist',
                                        title: 'type',
                                        autocommit: true,
                                        required: true,
                                        displayAttribute: 'type',
                                        validators: ['required'],
                                        collection: new Backbone.Collection([
                                            {
                                                id: 'green',
                                                type: 'green'
                                            },
                                            {
                                                id: 'yellow',
                                                type: 'yellow'
                                            }
                                        ]),
                                        allowEmptyValues: false,
                                        getReadonly: childModel => childModel.get('isPersisted'),
                                        valueType: 'id',
                                        editable: true
                                    }
                                ],
                                visible: () => !model.isEmpty()
                            }
                        ]
                    }
                ]
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
