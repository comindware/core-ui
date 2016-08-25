define([ 'comindware/core', 'demoPage/views/EditorCanvasView' ], function (core, EditorCanvasView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            radioValue: 'value2'
        });

        return new EditorCanvasView({
            editor: new core.form.editors.RadioGroupEditor({
                model: model,
                key: 'radioValue',
                changeMode: 'keydown',
                autocommit: true,
                radioOptions: [
                    {id: 'value1', displayText: 'Some Text 1'},
                    {id: 'value2', displayText: 'Some Text 2'},
                    {id: 'value3', displayText: 'Some Text 3'}
                ]
            }),
            presentation: '\'{{radioValue}}\''
        });
    };
});
