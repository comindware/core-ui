import { dateHelpers } from 'utils';
import { DateTime } from 'luxon';

export default {
    getDateDisplayValue(value?: string, format: string): string {
        let formattedDisplayValue;
        if (value === null) {
            formattedDisplayValue = '';
        } else {
            formattedDisplayValue = DateTime.fromISO(value).toFormat(format || dateHelpers.getFormat('dateISO'));
        }
        return formattedDisplayValue;
    },

    tryGetValidMoment(value?: string, format: string): DateTime {
        const sortedMom = this.getPrioritySortedFormats(format).map(f => DateTime.fromISO(value).toFormat(f));

        return sortedMom.find(mom => mom.isValid());
    },

    getPrioritySortedFormats(format) {
        const formatPriority = [moment.ISO_8601, dateHelpers.getFormat('dateISO')];
        format && formatPriority.push(format);
        return formatPriority;
    },

    getTimeDisplayValue(value?: string, format: string): string {
        let formattedValue;
        if (value === null || value === '') {
            formattedValue = '';
        } else if (format) {
            formattedValue = DateTime.fromISO(value).toFormat(format);
        } else {
            formattedValue = dateHelpers.getDisplayTime(DateTime.fromISO(value).toString());
        }
        return formattedValue;
    }
};
