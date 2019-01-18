//@flow
import { dateHelpers } from 'utils';

export default {
    getDateDisplayValue(value?: string, format: string): string {
        let formattedDisplayValue;
        if (value === null) {
            formattedDisplayValue = '';
        } else {
            formattedDisplayValue = moment(value).format(format || dateHelpers.getFormat('dateISO'));
        }
        return formattedDisplayValue;
    },

    tryGetValidMoment(value?: string, format: string): string {
        const sortedMom = this.getPrioritySortedFormats(format).map(f => moment(value, f));
        return sortedMom.find(mom => mom.isValid());
    },

    getPrioritySortedFormats(format) {
        const formatPriority = [
            moment.ISO_8601,
            dateHelpers.getFormat('dateISO')
        ];
        format && formatPriority.push(format);
        return formatPriority;
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
