import { dateHelpers } from 'utils';
import LocalizationService from '../../../services/LocalizationService';
import * as moment from 'moment';

export default {
    getDateDisplayValue(value, format, timezoneOffset) {
        let formattedDisplayValue;
        if (value === null) {
            formattedDisplayValue = '';
        } else if (format) {
            formattedDisplayValue = moment.utc(value).locale(LocalizationService.langCode).format(format);
        } else {
            formattedDisplayValue = dateHelpers.getDisplayDate(moment.utc(value).utcOffset(timezoneOffset));
        }
        return formattedDisplayValue;
    },

    getTimeDisplayValue(value, format, timezoneOffset) {
        let formattedValue;
        if (value === null || value === '') {
            formattedValue = '';
        } else if (format) {
            formattedValue = moment.utc(value).utcOffset(timezoneOffset).format(format);
        } else {
            formattedValue = dateHelpers.getDisplayTime(moment.utc(value).utcOffset(timezoneOffset));
        }
        return formattedValue;
    }
};
