/**
 * Developer: Ksenia Kartvelishvili
 * Date: 8/2/2017
 * Copyright: 2009-2017 Ksenia Kartvelishvili®
 *       All Rights Reserved
 * Published under the MIT license
 */

import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    return new CanvasView({
        view: new core.layout.Group({
            name: 'Group',
            view: new core.layout.VerticalLayout({
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
            })
        })
    });
}
