/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

define(
    [
        'comindware/core',
        'demoPage/views/CanvasView'
    ],
    (core, CanvasView) => {
        'use strict';

        return function() {
            const model = new Backbone.Model({
                name: 'new operation',
                idealDays: 12,
                dueDate: '2015-07-20T10:46:37Z',
                description: 'no-op',
                computed: false
            });

            const formSchema = {
                name: {
                    title: 'Name',
                    type: 'Text'
                },
                idealDays: {
                    title: 'Ideal Days',
                    type: 'Number'
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
                    type: 'TextArea'
                },
            };

            const createPopup = () => new core.layout.Popup({
                size: {
                    width: '800px',
                    height: '700px'
                },
                header: 'New Operation',
                buttons: [
                    {
                        id: true,
                        text: 'Save',
                        handler(popup) {
                            popup.content.form.commit();
                            core.services.WindowService.closePopup();
                            alert(JSON.stringify(model.toJSON(), null, 4));
                        }
                    },
                    {
                        id: false,
                        text: 'Cancel',
                        handler(popup) {
                            core.services.WindowService.closePopup();
                        }
                    }
                ],
                content: new core.layout.Form({
                    model,
                    schema: formSchema,
                    content: new core.layout.TabLayout({
                        tabs: [
                            {
                                id: 'general',
                                name: 'General',
                                view: new core.layout.VerticalLayout({
                                    rows: [
                                        core.layout.createFieldAnchor('name'),
                                        new core.layout.HorizontalLayout({
                                            columns: [
                                                core.layout.createFieldAnchor('idealDays'),
                                                core.layout.createFieldAnchor('dueDate')
                                            ]
                                        }),
                                        core.layout.createFieldAnchor('description'),
                                        core.layout.createEditorAnchor('computed')
                                    ]
                                })
                            },
                            {
                                id: 'expression',
                                name: 'Computed Expression',
                                view: core.layout.createEditorAnchor('expression')
                            }
                        ]
                    })
                })
            });

            const View = Marionette.ItemView.extend({
                template: Handlebars.compile('<input class="js-show-popup" type="button" value="Show Popup" />'),

                events: {
                    'click .js-show-popup'() {
                        core.services.WindowService.showPopup(createPopup());
                    }
                }
            });

            return new View();
        };
    }
);
