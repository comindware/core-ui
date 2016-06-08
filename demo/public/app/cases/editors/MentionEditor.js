define([
    'comindware/core', 'demoPage/views/EditorCanvasView', 'demoPage/views/PresentationItemView'
], function (core, EditorCanvasView, PresentationItemView) {
    'use strict';
    return function () {
        var model = new Backbone.Model({
            textAreaValue: 'Type a @mention to see suggestion...'
        });

        var editor = new core.form.editors.MentionEditor({
            model: model,
            key: 'textAreaValue',
            autocommit: true,
            editorOptions: {
                // TextAreaEditorView options
                changeMode: 'keydown'
            }
        });

        return new EditorCanvasView({
            editor: editor,
            presentation: PresentationItemView.extend({
                template: Handlebars.compile(
                    '<span>model[textAreaValue]: </span>' +
                    '<div style="display: inline-block">\'{{{textAreaValue}}}</div>\'' +
                    '<br/><br/><input type="button" class="js-get-mentions-button" value="getMentions()">'
                ),
                templateHelpers: function () {
                    return {
                        textAreaValue: core.utils.htmlHelpers.highlightMentions(this.model.get('textAreaValue'))
                    };
                },
                events: {
                    'click .js-get-mentions-button': '__getMentions'
                },
                __getMentions: function () {
                    alert(JSON.stringify(editor.getMentions()));
                }
            })
        });
    };
});
