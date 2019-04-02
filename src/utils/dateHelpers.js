/* Useful and general methods for work with Date and Time put here*/

import LocalizationService from '../services/LocalizationService';

const dateTimeFormats = {
    en: {
        shortDate: { general: 'MM/D/YYYY' /* 6/15/2009 */ },
        dateISO: { general: 'MM/DD/YYYY' /* 12/31/2018 */ },
        condensedDate: { general: 'MMM. D, YYYY' /* Jun. 15, 2009 */ },
        longDate: { general: 'dddd, MMMM D, YYYY' /* Monday, June 15, 2009 */ },
        monthDay: { general: 'MMMM D' /* June 15 */ },
        yearMonth: { general: 'MMMM, YYYY' /* June, 2009 */ },
        fullDateShortTime: {
            general: 'dddd, MMMM D, YYYY h:mm A', // Monday, June 15, 2009 1:45 PM
            date: 'dddd, MMMM D, YYYY', // Monday, June 15
            time: 'h:mm A' // 1:45 PM
        },
        fullDateLongTime: {
            general: 'dddd, MMMM D, YYYY h:mm:ss A', // Monday, June 15, 2009 1:45:30 PM
            date: 'dddd, MMMM D, YYYY', // Monday, June 15, 2009
            time: 'h:mm:ss A' // 1:45:30 PM
        },
        generalDateShortTime: {
            general: 'MM/DD/YYYY h:mm A', // 6/15/2009 1:45 PM
            date: 'MM/DD/YYYY', // 6/15/2009
            time: 'h:mm A' // 1:45 PM
        },
        generalDateLongTime: {
            general: 'MM/DD/YYYY h:mm:ss A', // 6/15/2009 1:45:30 PM
            date: 'MM/DD/YYYY', // 6/15/2009
            time: 'h:mm:ss A' // 1:45:30 PM
        },
        condensedDateTime: {
            general: 'MMM. D, YYYY h:mm A', // Jun. 15, 2009 1:45 PM
            date: 'MMM. D, YYYY', // Jun. 15, 2009
            time: 'h:mm A' // 1:45 PM
        },
        shortTime: {
            general: '', // 2014-12-29T11:45:00+04:00 it's ISO date(!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2014-12-29
            time: 'HH:mm:ssZ' // 11:45:00+04:00
        },
        longTime: { general: 'h:mm:ss A' }, // 1:45:30 PM
        dateTimeISO: {
            general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2005-08-09
            time: 'HH:mm:ss' // 18:31:42
        }
    },
    de: {
        shortDate: { general: 'DD.MM.YYYY' /* 03.12.2014 */ },
        dateISO: { general: 'YYYY-MM-DD' /* 2018-12-31 */ },
        condensedDate: { general: 'DD. MMM YYYY' /* 03. Dez. 2014 */ },
        longDate: { general: 'dddd, DD. MMMM YYYY' /* Mittwoch, 03. Dezember 2014 */ },
        monthDay: { general: 'DD. MMMM' /* 03. Dezember */ },
        yearMonth: { general: 'MMMM YYYY' /* Dezember 2014 */ },
        fullDateShortTime: {
            general: 'dddd, DD. MMMM YYYY HH:mm', // Mittwoch, 03. Dezember 2014 19:00
            date: 'dddd, DD. MMMM YYYY', // Mittwoch, 03. Dezember 2014
            time: 'HH:mm' // 19:00
        },
        fullDateLongTime: {
            general: 'dddd, DD. MMMM YYYY HH:mm:ss', // Mittwoch, 03. Dezember 2014 19:00:00
            date: 'dddd, DD. MMMM YYYY', // Mittwoch, 03. Dezember 2014
            time: 'HH:mm:ss' //19:00:00
        },
        generalDateShortTime: {
            general: 'DD.MM.YYYY HH:mm', // 03.12.2014 19:00
            date: 'DD.MM.YYYY', // 03.12.2014
            time: 'HH:mm' // 19:00
        },
        generalDateLongTime: {
            general: 'DD.MM.YYYY HH:mm:ss', // 03.11.2014 19:00:00
            date: 'DD.MM.YYYY', // 6/15/2009
            time: 'HH:mm:ss' //1:45:30 PM
        },
        condensedDateTime: {
            general: 'MMM D, YYYY h:mm A', // Jun. 15, 2009 1:45 PM
            date: 'MMM D, YYYY', // Jun. 15, 2009
            time: 'h:mm A' // 1:45 PM
        },
        shortTime: {
            general: '', // 2014-12-29T11:45:00+04:00 it's ISO date(!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2014-12-29
            time: 'HH:mm:ssZ' // 11:45:00+04:00
        },
        longTime: {
            general: 'h:mm:ss A' /// 1:45:30 PM
        },
        dateTimeISO: {
            general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2005-08-09
            time: 'HH:mm:ss' // 18:31:42
        }
    },
    ru: {
        shortDate: { general: 'DD.MM.YYYY' /* 03.12.2009 */ },
        dateISO: { general: 'DD.MM.YYYY' /* 31.12.2018 */ },
        condensedDate: { general: 'D MMM YYYY' /* 3 Дек 2014 */ },
        longDate: { general: 'D MMMM YYYY' /* 3 декабря 2014 */ },
        monthDay: { general: 'D MMMM' /* 3 декабря */ },
        yearMonth: { general: 'MMMM YYYY' /* декабрь 2014 */ },
        fullDateShortTime: {
            general: 'D MMMM, YYYY HH:mm', /* 3 декабря 2014 19:00 */
            date: 'D MMMM, YYYY', // 3 декабря 2014
            time: 'HH:mm' // 19:00
        },
        fullDateLongTime: {
            general: 'D MMMM, YYYY HH:mm:ss', // 3 декабря 2014 19:00:00
            date: 'D MMMM, YYYY', // 3 декабря 2014
            time: 'HH:mm:ss' // 19:00:00
        },
        generalDateShortTime: {
            general: 'DD.MM.YYYY HH:mm', // 03.11.2014 19:00
            date: 'DD.MM.YYYY', // 03.11.2014
            time: 'HH:mm' // 19:00
        },
        generalDateLongTime: {
            general: 'DD.MM.YYYY HH:mm:ss', // 03.11.2014 19:00:00
            date: 'DD.MM.YYYY', // 03.11.2014
            time: 'HH:mm:ss' // 19:00:00
        },
        condensedDateTime: {
            general: 'MMM. D, YYYY h:mm A', // Jun. 15, 2009 1:45 PM
            date: 'MMM. D, YYYY', // Jun. 15, 2009
            time: 'h:mm A' // 1:45 PM
        },
        shortTime: {
            general: '', // 2014-12-29T11:45:00+04:00 it's ISO date(!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2014-12-29
            time: 'HH:mm:ssZ' // 11:45:00+04:00
        },
        longTime: { general: 'h:mm:ss A' /* 1:45:30 PM */ },
        dateTimeISO: {
            general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2005-08-09
            time: 'HH:mm:ss' // 18:31:42
        }
    }
};

export default /** @lends module:core.utils.dateHelpers */ {
    durationISOToObject(duration) {
        if (!duration) {
            return null;
        }
        return this.durationToObject(duration);
    },

    durationToObject(duration) {
        const val = moment.duration(duration);

        return {
            // we don't use moment.days() here because it returns only up to 30 days
            days: Math.floor(val.asDays()),
            hours: val.hours(),
            minutes: val.minutes(),
            seconds: val.seconds()
        };
    },

    dateISOToDuration(dateIsoString, options) {
        const opt = _.defaults(options, { seconds: true, minutes: true, hours: true, days: true, months: false, years: false });
        const mom = moment(dateIsoString);

        return moment.duration({
            seconds: opt.seconds && mom.seconds(),
            minutes: opt.minutes && mom.minutes(),
            hours: opt.hours && mom.hours(),
            days: opt.days && mom.days(),
            months: opt.months && mom.month(),
            years: opt.years && mom.years()
        });
    },

    isFormatHasSeconds(format) {
        if (typeof format !== 'string') {
            return false;
        }
        return format.includes('s') || format.includes('S');
    },

    getWeekStartDay() {
        let startDay = 0;

        switch (LocalizationService.langCode) {
            case 'ru':
            case 'de':
                startDay = 1;
                break;
            default:
                startDay = 0;
                break;
        }

        return startDay;
    },

    getDisplayDate(val) {
        const format = this.getFormat('dateISO');

        return val ? moment(val).format(format) : '';
    },

    getFormat(formatName, formatPart = 'general') {
        const lang = LocalizationService.langCode;
        if (!dateTimeFormats[lang][formatName]) {
            throw new Error(`Unexpected format ${formatName}`);
        }
        return dateTimeFormats[lang][formatName][formatPart];
    },

    getDisplayTime(time) {
        const lang = LocalizationService.langCode;
        const format = dateTimeFormats[lang].fullDateShortTime.time;

        return time.format(format);
    },

    getTimeEditFormat(hasSeconds) {
        return hasSeconds
            ? dateTimeFormats[LocalizationService.langCode].generalDateLongTime.time
            : dateTimeFormats[LocalizationService.langCode].generalDateShortTime.time;
    },

    dateToDateTimeString(date, formatName) {
        const lang = LocalizationService.langCode;
        return moment(date).format(dateTimeFormats[lang][formatName].general);
    }
};
