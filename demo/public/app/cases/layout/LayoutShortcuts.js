/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import core from 'comindware/core';

export default function() {
    const model = new Backbone.Model({
        title: 'foo',
        idealDays: 12,
        dueDate: '2015-07-20T10:46:37Z',
        description: 'bar\nbaz',
        blocked: true
    });

    const View = Marionette.LayoutView.extend({
        initialize() {
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
                schema() {
                    return {
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
                }
            }
        },

        onShow() {
            this.layoutRegion.show(core.layout.createFromSchema({
                type: 'VerticalLayout',
                rows: [
                    {
                        type: 'FieldAnchor',
                        key: 'title'
                    },
                    {
                        type: 'HorizontalLayout',
                        columns: [
                            {
                                type: 'FieldAnchor',
                                key: 'idealDays'
                            },
                            {
                                type: 'FieldAnchor',
                                key: 'dueDate'
                            }
                        ]
                    },
                    {
                        type: 'FieldAnchor',
                        key: 'description'
                    },
                    {
                        type: 'EditorAnchor',
                        key: 'blocked'
                    }
                ]
            }));
            this.renderForm();
        }
    });

    return new View();
}
