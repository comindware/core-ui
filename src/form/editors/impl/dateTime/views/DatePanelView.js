import { dateHelpers } from 'utils';
import template from '../templates/datePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';

const defaultOptions = {
    pickerFormat: 'YYYY-MM-DD'
};

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize() {
        this.pickerOptions = {
            minView: 2,
            format: this.options.pickerFormat,
            todayBtn: true,
            weekStart: dateHelpers.getWeekStartDay(),
            language: LocalizationService.langCode
        };
    },

    className: 'dropdown__wrp dropdown__wrp_datepicker',

    ui: {
        pickerInput: '.js-datetimepicker'
    },

    updatePickerDate(val) {
        let value = val;
        if (isNaN(val)) {
            value = new Date();
            return;
        }

        const format = defaultOptions.pickerFormat;
        const pickerFormattedDate = val ? moment(new Date(val)).format(format) : moment({}).format(format);
        this.ui.pickerInput.datetimepicker('setDate', value);
        this.ui.pickerInput.attr('data-date', pickerFormattedDate);
        this.ui.pickerInput.datetimepicker('update');
    },

    updateValue(date) {
        this.updatePickerDate(date);
        this.trigger('select', date);
    },

    onAttach() {
        this.ui.pickerInput.datetimepicker(this.pickerOptions).on('changeDate', e => this.updateValue(e.date));
        this.updatePickerDate(new Date(this.options.value));
    }
});
