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

    modelEvents: {
        'change:value': 'updatePickerDate'
    },

    ui: {
        pickerInput: '.js-datetimepicker'
    },

    updatePickerPanelValue(value: string) {
        let data = new Date(value);
        if (isNaN(data)) {
            data = new Date();
        }

        this.ui.pickerInput.datetimepicker('setDate', data);

        const oldValue = new Date(this.model.get('value'));

        const newVal = moment({
            year: data.getFullYear(),
            month: data.getMonth(),
            date: data.getDate(),
            hour: oldValue.getHours(),
            minute: oldValue.getMinutes()
        }).toISOString();

        this.model.set({ value: newVal });
    },

    updatePickerDate() {
        const val = this.model.get('value');
        const format = defaultOptions.pickerFormat;
        const pickerFormattedDate = val ? moment(new Date(val)).format(format) : moment({}).format(format);

        this.ui.pickerInput.attr('data-date', pickerFormattedDate);
        this.ui.pickerInput.datetimepicker('update');
    },

    updateValue(date) {
        let newVal = null;

        if (date === null || date === '') {
            newVal = null;
        } else {
            newVal = moment({
                year: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate()
            }).toISOString();
        }

        this.model.set({ value: newVal });
    },

    onAttach() {
        this.ui.pickerInput.datetimepicker(this.pickerOptions).on('changeDate', e => {
            this.updateValue(e.date);
            this.trigger('select');
        });
        this.updatePickerDate();
    }
});
