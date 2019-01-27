import TextEditorView from '../../../TextEditorView';

export default TextEditorView.extend({
    triggers: {
        'keydown @ui.input': {
            event: 'keydown',
            preventDefault: false,
            stopPropagation: false
        }
    }
});
