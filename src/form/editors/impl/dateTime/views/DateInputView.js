import { helpers, dateHelpers } from 'utils';
import LocalizationService from '../../../../../services/LocalizationService';
import DateTimeService from '../../../services/DateTimeService';
import template from '../templates/dateInput.hbs';

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'allowEmptyValue');
        this.editDateFormat = dateHelpers.getDateEditFormat();
    },

    template: Handlebars.compile(template),

    className: 'date-view',

    ui: {
        dateInput: '.js-date-input'
    },

    modelEvents: {
        'change:value': 'updateDisplayValue',
        'change:readonly': '__onEnabledChange',
        'change:enabled': '__onEnabledChange'
    },

    events: {
        click: '__onClick',
        'focus @ui.dateInput': '__onFocus'
    },

    startEditing() {
        const value = this.model.get('value');
        const editableText = value ? moment(value).format(this.editDateFormat) : '';
        this.ui.dateInput.val(editableText);
    },

    endEditing() {
        const parsedInputValue = this.__getParsedInputValue();
        const inputIsEmpty = parsedInputValue === null;

        if (inputIsEmpty && this.options.allowEmptyValue) {
            this.__setModelValue(null);
        } else if (parsedInputValue.isValid()) {
            this.__setModelValue(parsedInputValue);
        }

        this.updateDisplayValue();
    },

    __getParsedInputValue() {
        const value = this.ui.dateInput.val();
        if (value === '') {
            return null;
        }
        return moment(value, this.editDateFormat, true);
    },

    onRender() {
        this.setPlaceholder();
        this.setInputPermissions();
        this.updateDisplayValue();
    },

    __onEnabledChange() {
        this.setPlaceholder();
        this.setInputPermissions();
    },

    __onClick() {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.trigger('calendar:open');
        }
    },

    setPlaceholder() {
        if (!this.model.get('enabled') || this.model.get('readonly')) {
            this.placeholder = '';
        } else {
            this.placeholder = LocalizationService.get('CORE.FORM.EDITORS.DATE.EMPTYPLACEHOLDER');
        }

        this.ui.dateInput.prop('placeholder', this.placeholder);
    },

    setInputPermissions() {
        const enabled = this.model.get('enabled');
        const readonly = this.model.get('readonly');

        if (!enabled) {
            this.ui.dateInput.prop('disabled', true);
        } else {
            this.ui.dateInput.prop('disabled', false);
        }

        if (readonly) {
            this.ui.dateInput.prop('readonly', true);
        } else {
            this.ui.dateInput.prop('readonly', false);
        }
    },

    updateDisplayValue() {
        if (this.isDestroyed()) {
            return;
        }
        const displayValue = DateTimeService.getDateDisplayValue(this.model.get('value'), this.options.dateDisplayFormat);
        this.ui.dateInput.val(displayValue);
        if (this.getOption('showTitle')) {
            this.$el.prop('title', displayValue);
        }
    },

    __setModelValue(date) {
        let newVal = null;

        if (date === null || date === '') {
            newVal = null;
        } else {
            newVal = date.toISOString();
        }

        this.model.set({ value: newVal });
    },

    __onFocus() {
        this.trigger('focus');
    },

    focus() {
        this.ui.dateInput.focus();
        this.trigger('focus');
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.trigger('calendar:open');
        }
    }
});
