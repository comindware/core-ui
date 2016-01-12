define([
    'comindware/core', 'demoPage/views/EditorCanvasView', 'demoPage/views/PresentationItemView'
], function(core, EditorCanvasView, PresentationItemView) {
    'use strict';
    return function() {

        var selectableItems = _.times(10, function(index) {
            return {
                id: index + 1,
                text: 'Item ' + (index + 1)
            };
        });

        var model = new Backbone.Model({
            multiValue: [0, 2, 4, 6, 8, 10, 100]
        });
        
        var editor = new core.form.editors.MultiSelectEditor({
            model: model,
            key: 'multiValue',
            autocommit: true,
            collection: new Backbone.Collection(selectableItems),
            allowEmptyValue: false,
            explicitApply: true
        });

        return new EditorCanvasView({
            editor: editor,
            presentation: '{{#if multiValue}}[{{multiValue}}]{{else}}null{{/if}}'
        });
    };
});
