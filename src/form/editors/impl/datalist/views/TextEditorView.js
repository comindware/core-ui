import template from '../templates/button.hbs';
import TextEditorView from '../../../TextEditorView';

export default TextEditorView.extend({
    template: Handlebars.compile(template),

    className: 'bubbles',

    regions: {
        collectionRegion: {
            el: '.js-collection-region',
            replaceElement: true
        }
    },

    triggers: {
        'keydown @ui.input': {
            event: 'input:keydown',
            preventDefault: false,
            stopPropagation: false
        },
        'input @ui.input': {
            event: 'input:search',
            preventDefault: false,
            stopPropagation: false
        }
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input'
    },

    onRender() {
        const value = this.getValue() || '';
        this.ui.input.val(value);
    },

    getInputValue() {
        return this.ui.input.val && this.ui.input.val();
    },

    setInputValue(value) {
        return this.ui.input.val && this.ui.input.val(value);
    },
});
