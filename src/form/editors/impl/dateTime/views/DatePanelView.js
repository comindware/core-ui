import { dateHelpers } from 'utils';
import template from '../templates/datePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';

const defaultOptions = () => ({
    format: 'YYYY-MM-DD',
    minView: 2,
    todayBtn: true,
    weekStart: dateHelpers.getWeekStartDay(),
    language: LocalizationService.langCode
});

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize() {
        _.defaults(this.options, defaultOptions());
    },

    className: 'dropdown__wrp dropdown__wrp_datepicker',

    ui: {
        pickerInput: '.js-datetimepicker'
    },

    updatePickerDate(value) {
        // if value is null or undefined, set now date to picker
        // moment return current date if has no args
        const mom = moment(
            value === null ? 
                undefined :
                value
            );
        const pickerFormattedDate = mom.format(this.options.format);

        this.ui.pickerInput.datetimepicker('setDate', mom.toDate());
        this.ui.pickerInput.attr('data-date', pickerFormattedDate);
    },

    updateValue(date) {
        this.updatePickerDate(date);
        this.trigger('select', date);
    },

    onAttach() {
        this.ui.pickerInput.datetimepicker(this.options).on('changeDate', e => this.updateValue(e.date));
    }
});
