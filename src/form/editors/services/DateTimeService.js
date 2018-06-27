//@flow
import { dateHelpers } from 'utils';

export default {
    getDateDisplayValue(value?: string, format: string): string {
        let formattedDisplayValue;
        if (value === null) {
            formattedDisplayValue = '';
        } else if (format) {
            formattedDisplayValue = moment(value).format(format);
        } else {
            formattedDisplayValue = dateHelpers.getDisplayDate(moment(value));
        }
        return formattedDisplayValue;
    },

    getTimeDisplayValue(value?: string, format: string): string {
        let formattedValue;
        if (value === null || value === '') {
            formattedValue = '';
        } else if (format) {
            formattedValue = moment(value).format(format);
        } else {
            formattedValue = dateHelpers.getDisplayTime(moment(value));
        }
        return formattedValue;
    }
};
