/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

define(
    [
        'comindware/core'
    ],
    function(core) {
        'use strict';

        return function() {
            return new core.layout.VerticalLayout({
                rows: [
                    new core.form.editors.TextEditor({
                        value: 'foo'
                    }),
                    new core.form.editors.TextAreaEditor({
                        value: 'bar'
                    }),
                    new core.form.editors.NumberEditor({
                        value: 123
                    }),
                    new core.form.editors.DateTimeEditor({
                        value: '2015-07-20T10:46:37Z'
                    }),
                    new core.form.editors.BooleanEditor({
                        value: true,
                        displayText: 'Make me some tea!'
                    })
                ]
            });
        };
    }
);
