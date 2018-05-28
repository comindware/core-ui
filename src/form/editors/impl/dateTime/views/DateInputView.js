import { helpers, dateHelpers } from 'utils';
import LocalizationService from '../../../../../services/LocalizationService';
import DateTimeService from '../../../services/DateTimeService';
import template from '../templates/dateInput.hbs';

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'allowEmptyValue');
        this.editDateFormat = options.dateDisplayFormat;
    },

    template: Handlebars.compile(template),

    className: 'date-view',

    ui: {
        dateInput: '.js-date-input'
    },

    events: {
        click: '__onClick',
        'focus @ui.dateInput': '__onFocus'
    },

    onRender() {
        this.setValue(this.options.value);
    },

    __onClick() {
        this.trigger('calendar:open');
    },

    setPlaceholder() {
        this.placeholder = LocalizationService.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER');
        this.ui.dateInput.prop('placeholder', this.placeholder);
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
    },

    focus() {
        this.ui.dateInput.focus();
        this.trigger('focus');
        this.trigger('calendar:open');
    }
});
