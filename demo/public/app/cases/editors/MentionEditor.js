

import CanvasView from 'demoPage/views/CanvasView';
import PresentationItemView from 'demoPage/views/PresentationItemView';

export default function() {
    const model = new Backbone.Model({
        textAreaValue: 'Type a @mention to see suggestion...'
    });

    const editor = new core.form.editors.MentionEditor({
        model,
        key: 'textAreaValue',
        autocommit: true,
        editorOptions: {
            // TextAreaEditorView options
            changeMode: 'keydown'
        }
    });

    return new CanvasView({
        editor,
        presentation: PresentationItemView.extend({
            template: Handlebars.compile(
                '<span>model[textAreaValue]: </span>' +
                '<div style="display: inline-block">\'{{{textAreaValue}}}</div>\'' +
                '<br/><br/><input type="button" class="js-get-mentions-button" value="getMentions()">'
            ),
            templateContext() {
                return {
                    textAreaValue: core.utils.htmlHelpers.highlightMentions(this.model.get('textAreaValue'))
                };
            },
            events: {
                'click .js-get-mentions-button': '__getMentions'
            },
            __getMentions() {
                alert(JSON.stringify(editor.getMentions()));
            }
        }),
        isEditor: true
    });
}
