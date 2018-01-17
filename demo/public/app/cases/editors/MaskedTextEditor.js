
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        textValue: 'FAX7'
    });

    return new CanvasView({
        view: new core.form.editors.TextEditor({
            model,
            key: 'textValue',
            changeMode: 'keydown',
            autocommit: true,
            mask: 'aa*: +9(999)999-9999',
            maskPlaceholder: '_'
        }),
        presentation: "{{#isNull textValue}}null{{else}}'{{textValue}}'{{/isNull}}"
    });
}
