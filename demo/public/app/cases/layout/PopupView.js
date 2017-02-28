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
    function(core, CanvasView) {
        'use strict';

        return function() {
            const model = new Backbone.Model({
                title: 'foo',
                idealDays: 12,
                dueDate: '2015-07-20T10:46:37Z',
                description: 'bar\nbaz',
                blocked: true
            });

            /*const PopupView = Marionette.LayoutView.extend({
                initialize: function (options) {
                    this.model = model;
                },

                template: Handlebars.compile('<div class="js-layout" />'),

                regions: {
                    layoutRegion: '.js-layout'
                },

                behaviors: {
                    BackboneFormBehavior: {
                        behaviorClass: core.form.behaviors.BackboneFormBehavior,
                        renderStrategy: 'manual',
                        schema: function () {
                            return {
                            };
                        }
                    }
                }
            });*/

            const formSchema = {
                title: {
                    title: 'Title',
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
                blocked: {
                    type: 'Boolean',
                    displayText: 'Blocked by another task'
                }
            };

            const PopupView = new core.layout.Popup({
                header: 'New Operation',
                buttons: [
                    {
                        id: true,
                        text: 'Save',
                        handler (popup) {
                            popup.content.form.commit();
                            core.services.WindowService.closePopup();
                        }
                    },
                    {
                        id: false,
                        text: 'Cancel',
                        handler (popup) {
                            core.services.WindowService.closePopup();
                        }
                    }
                ],
                content: new core.layout.Form({
                    model: model,
                    schema: formSchema,
                    content: new core.layout.VerticalLayout({
                        rows: [
                            core.layout.createFieldAnchor('title'),
                            new core.layout.HorizontalLayout({
                                columns: [
                                    core.layout.createFieldAnchor('idealDays'),
                                    core.layout.createFieldAnchor('dueDate')
                                ]
                            }),
                            core.layout.createFieldAnchor('description'),
                            core.layout.createEditorAnchor('blocked')
                        ]
                    })
                })
            });

            const View = Marionette.ItemView.extend({
                template: Handlebars.compile('<input class="js-show-popup" type="button" value="Show Popup" />'),

                events: {
                    'click .js-show-popup' () {
                        core.services.WindowService.showPopup(new PopupView());
                    }
                }
            });

            return new View();
        };
    }
);
