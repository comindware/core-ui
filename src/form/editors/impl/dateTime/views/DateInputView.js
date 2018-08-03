import { helpers } from 'utils';
import LocalizationService from '../../../../../services/LocalizationService';
import DateTimeService from '../../../services/DateTimeService';
import TextEditorView from '../../../TextEditorView';

export default TextEditorView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'allowEmptyValue');
    },

    events: {
        click: '__onClick',
        'focus @ui.input': '__onFocus'
    },

    onRender() {
        this.setPlaceholder();
        this.setValue(this.options.value);
    },

    setPlaceholder() {
        this.ui.input.prop('placeholder', LocalizationService.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER'));
    },

    setValue(value) {
        if (this.isDestroyed()) {
            return;
        }
        const displayValue = DateTimeService.getDateDisplayValue(value, this.options.dateDisplayFormat);
        this.ui.input.val(displayValue);
        if (this.getOption('showTitle')) {
            this.$el.prop('title', displayValue);
        }
    },

    __onClick() {
        this.trigger('calendar:open');
    },

    __onFocus() {
        this.trigger('focus');
    },

    focus() {
        this.ui.input.focus();
        this.trigger('focus');
        this.trigger('calendar:open');
    }
});
