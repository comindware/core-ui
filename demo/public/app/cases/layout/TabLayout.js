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
            return new CanvasView({
                view: new core.layout.TabLayout({
                    tabs: [
                        {
                            id: 'tab1',
                            name: 'Tab 1',
                            view: new core.form.editors.TextAreaEditor({
                                value: 'Content 1'
                            })
                        },
                        {
                            id: 'tab2',
                            name: 'Tab 2',
                            view: new core.form.editors.TextAreaEditor({
                                value: 'Content 2'
                            })
                        },
                        {
                            id: 'tab3',
                            name: 'Tab 3',
                            enabled: false,
                            view: new core.form.editors.TextAreaEditor({
                                value: 'Content 3'
                            })
                        },
                        {
                            id: 'tab4',
                            name: 'Tab 4',
                            error: 'Validation Error',
                            view: new core.form.editors.TextAreaEditor({
                                value: 'Content 4'
                            })
                        }
                    ]
                }),
                canvas: {
                    height: '400px'
                }
            });
        };
    }
);
