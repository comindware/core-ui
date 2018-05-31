import { helpers, dateHelpers } from 'utils';
import template from '../templates/timeInput.hbs';
import DateTimeService from '../../../services/DateTimeService';
import LocalizationService from '../../../../../services/LocalizationService';

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'allowEmptyValue');
        this.hasSeconds = this.__hasSeconds(options.timeDisplayFormat);
        this.timeEditFormat = dateHelpers.getTimeEditFormat(this.hasSeconds);
    },

    template: Handlebars.compile(template),

    ui: {
        input: '.js-time-input'
    },

    className: 'time-view',

    events: {
        'focus @ui.input': '__onFocus'
    },

    onRender() {
        this.setPlaceholder();
        this.setValue(this.options.value);
    },

    setValue(value) {
        const displayValue = DateTimeService.getTimeDisplayValue(value, this.options.timeDisplayFormat);
        this.ui.input.val(displayValue);
        if (this.getOption('showTitle')) {
            this.$el.prop('title', displayValue);
        }
    },

    setPlaceholder() {
        this.ui.input.prop('placeholder', LocalizationService.get('CORE.FORM.EDITORS.TIME.EMPTYPLACEHOLDER'));
    },

    __onFocus() {
        this.trigger('focus');
    },

    __hasSeconds(format) {
        switch (format) {
            case 'LTS':
            case 'HH:mm:ss':
                return true;
            case 'LT':
            default:
                return false;
        }
    }
});
