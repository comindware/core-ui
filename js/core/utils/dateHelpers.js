/**
 * Developer: Stepan Burguchev
 * Date: 7/8/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* Useful and general methods for work with Date and Time put here*/

"use strict";

import moment from '../libApi';

let defaultOptions = {
    ms: 60 * 1000,
    workHours: 8
};

let dateTimeFormats = {
    en: {
        shortDate: {general: 'MM/D/YYYY' /* 6/15/2009 */},
        sateISO: {general: 'YYYY-MM-DD'  /* 2005-08-09 */},
        condensedDate: {general: 'MMM. D, YYYY' /* Jun. 15, 2009 */},
        longDate: {general: 'dddd, MMMM D, YYYY' /* Monday, June 15, 2009 */},
        monthDay: {general: 'MMMM D' /* June 15 */},
        yearMonth: {general: 'MMMM, YYYY' /* June, 2009 */},
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
        longTime: {general: 'h:mm:ss A'}, // 1:45:30 PM
        dateTimeISO: {
            general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2005-08-09
            time: 'HH:mm:ss' // 18:31:42
        }
    },
    de: {
        shortDate: {general: 'DD.MM.YYYY' /* 03.12.2014 */},
        dateISO: {general: 'YYYY-MM-DD' /* 2005-08-09 */},
        condensedDate: {general: 'DD. MMM YYYY' /* 03. Dez. 2014 */},
        longDate: {general: 'dddd, DD. MMMM YYYY' /* Mittwoch, 03. Dezember 2014 */},
        monthDay: {general: 'DD. MMMM' /* 03. Dezember */},
        yearMonth: {general: 'MMMM YYYY' /* Dezember 2014 */},
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
            general: 'DD.MM.YYYY HH:mm:ss', // 6/15/2009 1:45:30 PM
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
        shortDate: {general: 'DD.MM.YYYY' /* 03.12.2009 */},
        dateISO: {general: 'YYYY-MM-DD' /* 2005-08-09 */},
        condensedDate: {general: 'D MMM YYYY' /* 3 Дек 2014 */},
        longDate: {general: 'dddd, D MMMM YYYY' /* среда, 3 декабря 2014 */},
        monthDay: {general: 'D MMMM' /* 3 декабря */},
        yearMonth: {general: 'MMMM YYYY' /* декабрь 2014 */},
        fullDateShortTime: {
            general: 'dddd, D MMMM, YYYY HH:mm', /* среда, 3 декабря 2014 19:00 */
            date: 'dddd, D MMMM, YYYY', // среда, 3 декабря 2014
            time: 'HH:mm' // 19:00
        },
        fullDateLongTime: {
            general: 'dddd, D MMMM, YYYY HH:mm:ss', // среда, 3 декабря 2014 19:00:00
            date: 'dddd, D MMMM, YYYY', // среда, 3 декабря 2014
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
        longTime: {general: 'h:mm:ss A' /* 1:45:30 PM */},
        dateTimeISO: {
            general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
            date: 'YYYY-MM-DD', // 2005-08-09
            time: 'HH:mm:ss' // 18:31:42
        }
    }
};

export default /** @lends module:core.utils.dateHelpers */ {
    /**
     * Takes a date in the format that momentJS supports and converts it into a JavaScript <code>Date</code> object.
     * @param {String|Date|Object} date Date string in ISO8601 format, JavaScript or momentJS date object.
     * @return {Date} JavaScript <code>Date</code> object.
     * */
    dateToISOString: function (date) {
        return moment(date).toISOString();
    },

    /**
     * Takes a date string in ISO8601 format and converts it into a JavaScript <code>Date</code> object.
     * @param {String} dateIsoString Date in ISO8601 format.
     * @return {Date} JavaScript <code>Date</code> object.
     * */
    dateISOToDate: function (dateIsoString) {
        return moment(dateIsoString).toDate();
    },

    durationISOToObject: function (duration) {
        if (!duration) {
            return [0, 0, 0];
        }
        var mDuration = moment.duration(duration);
        return [mDuration._days, mDuration.hours(), mDuration.minutes()]; //don't use moment.days() cause it's returns (duration._days % 30)
    },

    durationToISOString: function (duration) {
        if (duration === null) {
            return duration;
        }
        var mDuration = moment.duration();

        if (duration.days) {
            mDuration.add(duration.days, 'd');
        }
        if (duration.hours) {
            mDuration.add(duration.hours, 'h');
        }
        if (duration.minutes) {
            mDuration.add(duration.minutes, 'm');
        }

        return mDuration.toIsoString();
    },

    timestampToObjTakingWorkHours: function (value) {
        if (value === null) {
            return value;
        }
        var v = value || 0;
        v = v / defaultOptions.ms;
        return {
            days: Math.floor(v / 60 / defaultOptions.workHours),
            hours: Math.floor((v / 60) % defaultOptions.workHours),
            minutes: Math.floor(v % 60)
        };
    },

    objToTimestampTakingWorkHours: function (object) {
        return object ? (object.days * 60 * defaultOptions.workHours + object.hours * 60 + object.minutes) * defaultOptions.ms : object === 0 ? 0 : null;
    },

    getWeekStartDay: function () {
        var startDay = 0;

        switch (window.langCode) {
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

    getRelativeDate: function (val) {
        var lang = window.langCode,
            now = moment(),
            daysFromNow = now.diff(val, 'days');

        if (daysFromNow < 2) {
            return moment(val).locale(lang).calendar();
        } else {
            var format = dateTimeFormats[lang].condensedDate.general;
            return moment(val).locale(lang).format(format);
        }
    },

    getDisplayDate: function (val) {
        var lang = window.langCode,
            format = dateTimeFormats[lang].condensedDate.general;

        return val ? moment(val).locale(lang).format(format) : '';
    },

    getDisplayTime: function (time) {
        var lang = window.langCode,
            format = dateTimeFormats[lang].fullDateShortTime.time;

        return time.locale(lang).format(format);
    },

    getTimeEditFormat: function () {
        return dateTimeFormats[window.langCode].generalDateShortTime.time;
    },

    getDateEditFormat: function () {
        return dateTimeFormats[window.langCode].generalDateShortTime.date;
    },

    dateToDateTimeString: function(date, formatName) {
        var lang = window.langCode;
        return moment(date).format(dateTimeFormats[lang][formatName].general);
    },

    dateToDateString: function (date, formatName) {
        var lang = window.langCode;
        return moment(date).format(dateTimeFormats[lang][formatName].date);
    },

    dateToTimeString: function (date, formatName) {
        var lang = window.langCode;
        return moment(date).format(dateTimeFormats[lang][formatName].time);
    }
};
