import { helpers } from 'utils';
import LocalizationService from '../../../../../services/LocalizationService';
import DateTimeService from '../../../services/DateTimeService';
import template from '../templates/dateInput.hbs';

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'allowEmptyValue');
    },

    template: Handlebars.compile(template),

    className: 'date-view',

    ui: {
        dateInput: '.js-date-input'
    },

    events: {
        'focus @ui.dateInput': '__onFocus'
    },

    onRender() {
        this.setPlaceholder();
        this.setValue(this.options.value);
    },

    setPlaceholder() {
        this.ui.dateInput.prop('placeholder', LocalizationService.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER'));
    },

    setValue(value) {
        if (this.isDestroyed()) {
            return;
        }
        const displayValue = DateTimeService.getDateDisplayValue(value, this.options.dateDisplayFormat);
        this.ui.dateInput.val(displayValue);
        if (this.getOption('showTitle')) {
            this.$el.prop('title', displayValue);
        }
    },

    __onFocus() {
        this.trigger('focus');
    }
});
