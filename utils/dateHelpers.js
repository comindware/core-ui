/**
 * Developer: Kristina
 * Date: 24/12/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* Useful and general methods for work with Date and Time put here*/

define([],
    function () {
        'use strict';

        var defaultOptions = {
            ms: 60 * 1000,
            workHours: 8
        };

        /*
        * TODO: fix me! method signatures are inconsistent (!), method names are hard to understand. Create separate DURATION type.
        * */

         return {
            dateToISOString: function(date){
                return moment(date).toISOString();
            },

            dateISOToDate: function (dateIsoString) {
                return moment(dateIsoString).toDate();
            },

            durationISOToObject: function(duration) {
                if (!duration) return [0,0,0];

                var mDuration = moment.duration(duration);
                return [mDuration._days, mDuration.hours(), mDuration.minutes()]; //don't use moment.days() cause it's returns (duration._days % 30)
            },

            durationToISOString:  function(duration) {
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

                switch (Context.langCode) {
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

             dateTimeFormats: {
                 en: {
                     ShortDate: {general: 'MM/D/YYYY' /* 6/15/2009 */},
                     DateISO: {general: 'YYYY-MM-DD'  /* 2005-08-09 */},
                     CondensedDate: {general: 'MMM. D, YYYY' /* Jun. 15, 2009 */},
                     LongDate: {general: 'dddd, MMMM D, YYYY' /* Monday, June 15, 2009 */},
                     MonthDay: {general: 'MMMM D' /* June 15 */},
                     YearMonth: {general: 'MMMM, YYYY' /* June, 2009 */},
                     FullDateShortTime: {
                         general: 'dddd, MMMM D, YYYY h:mm A', // Monday, June 15, 2009 1:45 PM
                         date: 'dddd, MMMM D, YYYY', // Monday, June 15
                         time: 'h:mm A' // 1:45 PM
                     },
                     FullDateLongTime: {
                         general: 'dddd, MMMM D, YYYY h:mm:ss A', // Monday, June 15, 2009 1:45:30 PM
                         date: 'dddd, MMMM D, YYYY', // Monday, June 15, 2009
                         time: 'h:mm:ss A' // 1:45:30 PM
                     },
                     GeneralDateShortTime: {
                         general: 'MM/DD/YYYY h:mm A', // 6/15/2009 1:45 PM
                         date: 'MM/DD/YYYY', // 6/15/2009
                         time: 'h:mm A' // 1:45 PM
                     },
                     GeneralDateLongTime: {
                         general: 'MM/DD/YYYY h:mm:ss A', // 6/15/2009 1:45:30 PM
                         date: 'MM/DD/YYYY', // 6/15/2009
                         time: 'h:mm:ss A' // 1:45:30 PM
                     },
                     CondensedDateTime: {
                         general: 'MMM. D, YYYY h:mm A', // Jun. 15, 2009 1:45 PM
                         date: 'MMM. D, YYYY', // Jun. 15, 2009
                         time: 'h:mm A' // 1:45 PM
                     },
                     ShortTime: {
                         general: '', // 2014-12-29T11:45:00+04:00 it's ISO date(!) (wrong name from main tracker)
                         date: 'YYYY-MM-DD', // 2014-12-29
                         time: 'HH:mm:ssZ' // 11:45:00+04:00
                     },
                     LongTime: {general: 'h:mm:ss A'}, // 1:45:30 PM
                     DateTimeISO: {
                         general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
                         date: 'YYYY-MM-DD', // 2005-08-09
                         time: 'HH:mm:ss' // 18:31:42
                     }
                 },
                 de: {
                     ShortDate: {general: 'DD.MM.YYYY' /* 03.12.2014 */},
                     DateISO: {general: 'YYYY-MM-DD' /* 2005-08-09 */},
                     CondensedDate: {general: 'DD. MMM YYYY' /* 03. Dez. 2014 */},
                     LongDate: {general: 'dddd, DD. MMMM YYYY' /* Mittwoch, 03. Dezember 2014 */},
                     MonthDay: {general: 'DD. MMMM' /* 03. Dezember */},
                     YearMonth: {general: 'MMMM YYYY' /* Dezember 2014 */},
                     FullDateShortTime: {
                         general: 'dddd, DD. MMMM YYYY HH:mm', // Mittwoch, 03. Dezember 2014 19:00
                         date: 'dddd, DD. MMMM YYYY', // Mittwoch, 03. Dezember 2014
                         time: 'HH:mm' // 19:00
                     },
                     FullDateLongTime: {
                         general: 'dddd, DD. MMMM YYYY HH:mm:ss', // Mittwoch, 03. Dezember 2014 19:00:00
                         date: 'dddd, DD. MMMM YYYY', // Mittwoch, 03. Dezember 2014
                         time: 'HH:mm:ss' //19:00:00
                     },
                     GeneralDateShortTime: {
                         general: 'DD.MM.YYYY HH:mm', // 03.12.2014 19:00
                         date: 'DD.MM.YYYY', // 03.12.2014
                         time: 'HH:mm' // 19:00
                     },
                     GeneralDateLongTime: {
                         general: 'DD.MM.YYYY HH:mm:ss', // 6/15/2009 1:45:30 PM
                         date: 'DD.MM.YYYY', // 6/15/2009
                         time: 'HH:mm:ss' //1:45:30 PM
                     },
                     CondensedDateTime: {
                         general: 'MMM D, YYYY h:mm A', // Jun. 15, 2009 1:45 PM
                         date: 'MMM D, YYYY', // Jun. 15, 2009
                         time: 'h:mm A' // 1:45 PM
                     },
                     ShortTime: {
                         general: '', // 2014-12-29T11:45:00+04:00 it's ISO date(!) (wrong name from main tracker)
                         date: 'YYYY-MM-DD', // 2014-12-29
                         time: 'HH:mm:ssZ' // 11:45:00+04:00
                     },
                     LongTime: {
                         general: 'h:mm:ss A' /// 1:45:30 PM
                     },
                     DateTimeISO: {
                         general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
                         date: 'YYYY-MM-DD', // 2005-08-09
                         time: 'HH:mm:ss' // 18:31:42
                     }
                 },
                 ru: {
                     ShortDate: {general: 'DD.MM.YYYY' /* 03.12.2009 */},
                     DateISO: {general: 'YYYY-MM-DD' /* 2005-08-09 */},
                     CondensedDate: {general: 'D MMM YYYY' /* 3 Дек 2014 */},
                     LongDate: {general: 'dddd, D MMMM YYYY' /* среда, 3 декабря 2014 */},
                     MonthDay: {general: 'D MMMM' /* 3 декабря */},
                     YearMonth: {general: 'MMMM YYYY' /* декабрь 2014 */},
                     FullDateShortTime: {
                         general: 'dddd, D MMMM, YYYY HH:mm', /* среда, 3 декабря 2014 19:00 */
                         date: 'dddd, D MMMM, YYYY', // среда, 3 декабря 2014
                         time: 'HH:mm' // 19:00
                     },
                     FullDateLongTime: {
                         general: 'dddd, D MMMM, YYYY HH:mm:ss', // среда, 3 декабря 2014 19:00:00
                         date: 'dddd, D MMMM, YYYY', // среда, 3 декабря 2014
                         time: 'HH:mm:ss' // 19:00:00
                     },
                     GeneralDateShortTime: {
                         general: 'DD.MM.YYYY HH:mm', // 03.11.2014 19:00
                         date: 'DD.MM.YYYY', // 03.11.2014
                         time: 'HH:mm' // 19:00
                     },
                     GeneralDateLongTime: {
                         general: 'DD.MM.YYYY HH:mm:ss', // 03.11.2014 19:00:00
                         date: 'DD.MM.YYYY', // 03.11.2014
                         time: 'HH:mm:ss' // 19:00:00
                     },
                     CondensedDateTime: {
                         general: 'MMM. D, YYYY h:mm A', // Jun. 15, 2009 1:45 PM
                         date: 'MMM. D, YYYY', // Jun. 15, 2009
                         time: 'h:mm A' // 1:45 PM
                     },
                     ShortTime: {
                         general: '', // 2014-12-29T11:45:00+04:00 it's ISO date(!) (wrong name from main tracker)
                         date: 'YYYY-MM-DD', // 2014-12-29
                         time: 'HH:mm:ssZ' // 11:45:00+04:00
                     },
                     LongTime: {general: 'h:mm:ss A' /* 1:45:30 PM */},
                     DateTimeISO: {
                         general: 'YYYY-MM-DD HH:mm:ss', // 2005-08-09 18:31:42 its not ISO date (!) (wrong name from main tracker)
                         date: 'YYYY-MM-DD', // 2005-08-09
                         time: 'HH:mm:ss' // 18:31:42
                     }
                 }
             },

            getDisplayDate: function (val) {
                var lang = Context.langCode,
                    format = this.dateTimeFormats[lang].CondensedDate.general;

                return val ? moment(val).locale(lang).format(format) : '';
            },

             getDisplayTime: function (time) {
                 var //time = moment({hours: val.hours, minute: val.minutes}),
                     lang = Context.langCode,
                     format = this.dateTimeFormats[lang].FullDateShortTime.time;

                 return time.locale(lang).format(format);
             },

            setDateTimePickerLocalization: function () {
                var lang = Context.langCode;
                if ($.fn.datetimepicker.dates[lang]) {
                    return;
                }

                $.fn.datetimepicker.dates[lang] = {
                    days: Localizer.get('CORE.FORMATS.DATETIME.DAYSFULL').split(','),//["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    daysShort: Localizer.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','),//["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    daysMin: Localizer.get('CORE.FORMATS.DATETIME.DAYSSHORT').split(','),
                    months: Localizer.get('CORE.FORMATS.DATETIME.MONTHS').split(','),//["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                    monthsShort: Localizer.get('CORE.FORMATS.DATETIME.MONTHSSHORT').split(','),//["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    today: Localizer.get('CORE.FORMATS.DATETIME.TODAY'),
                    meridiem: Localizer.get('CORE.FORMATS.DATETIME.MERIDIEM').split(',')
                };
            }
        };
    });