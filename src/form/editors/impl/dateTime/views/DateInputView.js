import TextEditorView from '../../../TextEditorView';
import template from '../../../templates/dateInputEditor.hbs';

export default TextEditorView.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            ...this.options,
            type: 'text',
            size: this.__getInputSize()
        };
    },

    triggers: {
        'keydown @ui.input': {
            event: 'keydown',
            preventDefault: false,
            stopPropagation: false
        }
    },

    __updateInputValue(value) {
        this.ui.input.val(value);
        this.ui.input.get(0).size = this.__getInputSize();
    },

    __getInputSize() {
        const specialCoefficient = 0.97; // to get new size, this is because length refers to number of characters, where as size in most browsers refers to em units
        const minInputSize = 5;
        const inputSize = this.value ? this.value.length * specialCoefficient : 0;
        return inputSize === 0 ? minInputSize * specialCoefficient : inputSize;
    }
});
