define(['comindware/core', 'demoPage/views/CanvasView'],
    function (core, CanvasView) {
        'use strict';
        return function () {
            // 1. Create form template
            var template = '<div class="field-width" data-fields="text"></div>' +
                '<div class="field-width" data-fields="number"></div>' +
                '<div class="field-width" data-fields="dateTime"></div>' +
                '<div class="field-width" data-fields="duration"></div>' +
                '<div class="field-width" data-fields="dropdown"></div>';

            // 2. Create form model
            var model = new Backbone.Model({
                text: 'Text Example',
                number: 451,
                dateTime: new Date(1984, 0, 24),
                duration: 'P14DT4H15M',
                dropdown: 'd.2'
            });

            // 3. Create view with BackboneFormBehavior and construct form scheme
            var View = Marionette.ItemView.extend({
                initialize: function (options) {
                    this.model = model;
                },

                template: Handlebars.compile(template),

                behaviors: {
                    BackboneFormBehavior: {
                        behaviorClass: core.form.behaviors.BackboneFormBehavior,
                        schema: function () {
                            return {
                                text: {
                                    type: 'Text',
                                    title: 'Text'
                                },
                                number: {
                                    type: 'Number',
                                    title: 'Number'
                                },
                                dateTime: {
                                    type: 'DateTime',
                                    title: 'DateTime'
                                },
                                duration: {
                                    type: 'Duration',
                                    title: 'Duration'
                                },
                                dropdown: {
                                    type: 'Dropdown',
                                    title: 'Dropdown',
                                    collection: [{id: 'd.1', text: 'Text 1'}, {id: 'd.2', text: 'Text 2'}, {
                                        id: 'd.3',
                                        text: 'Text 3'
                                    }, {id: 'd.4', text: 'Text 4'}]
                                }
                            };
                        }
                    }
                }
            });

            // 4. Show created view
            return new CanvasView({
                view: new View(),
                canvas: {
                    height: '300px'
                }
            });
        };
    });
