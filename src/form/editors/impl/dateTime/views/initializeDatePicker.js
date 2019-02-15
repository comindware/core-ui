export default function($, dates) {
    let DPGlobal;

    const old = $.fn && $.fn.datetimepicker;

    function timeZoneAbbreviation() {
        const date = new Date().toString();
        let ref;

        return ((ref = date.split('(')[1]) != null ? ref.slice(0, -1) : 0) || date.split(' ');
    }

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }

    // Picker object
    const Datetimepicker = function(element, options) {
        this.element = $(element);

        this.language = options.language || 'en';
        this.language = this.language in dates ? this.language : this.language.split('-')[0]; // fr-CA fallback to fr
        this.language = this.language in dates ? this.language : 'en';
        this.isRTL = dates[this.language].rtl || false;
        this.formatType = options.formatType || this.element.data('format-type') || 'standard';
        this.format = DPGlobal.parseFormat(
            options.format || this.element.data('date-format') || dates[this.language].format || DPGlobal.getDefaultFormat(this.formatType, 'input'),
            this.formatType
        );

        this.title = typeof options.title === 'undefined' ? false : options.title;
        this.timezone = options.timezone || timeZoneAbbreviation();

        this.icons = {
            leftArrow: 'icon-arrow-left',
            rightArrow: 'icon-arrow-right'
        };

        this.minView = DPGlobal.convertViewMode(2);

        this.maxView = DPGlobal.convertViewMode(DPGlobal.modes.length - 1);

        this.startViewMode = DPGlobal.convertViewMode(2);

        this.viewMode = this.startViewMode;

        this.viewSelect = DPGlobal.convertViewMode(this.minView);

        const template = DPGlobal.template;

        this.picker = $(template)
            .appendTo(this.element)
            .on({
                click: $.proxy(this.click, this),
                mousedown: $.proxy(this.mousedown, this)
            });

        this.picker.addClass('datetimepicker-inline');

        if (this.isRTL) {
            this.picker.addClass('datetimepicker-rtl');
            const selector = '.prev i, .next i';
            this.picker.find(selector).toggleClass(`${this.icons.leftArrow} ${this.icons.rightArrow}`);
        }

        this.weekStart = 0;
        if (typeof options.weekStart !== 'undefined') {
            this.weekStart = options.weekStart;
        } else if (typeof dates[this.language].weekStart !== 'undefined') {
            this.weekStart = dates[this.language].weekStart;
        }
        this.weekStart = this.weekStart % 7;
        this.weekEnd = (this.weekStart + 6) % 7;
        this.onRenderDay = date => {
            const render = (() => [])(date);

            const res = ['day'];
            return res.concat(render || []);
        };

        this.onRenderYear = function(date) {
            const render = (() => [])(date);
            const res = ['year'];

            if (this.date.getFullYear() === date.getFullYear()) {
                res.push('active');
            }
            const currentYear = date.getFullYear();
            const endYear = this.endDate.getFullYear();
            if (date < this.startDate || currentYear > endYear) {
                res.push('disabled');
            }
            return res.concat(render || []);
        };
        this.onRenderMonth = function(date) {
            const render = (() => [])(date);
            const res = ['month'];

            return res.concat(render || []);
        };
        this.startDate = new Date(-8639968443048000);
        this.endDate = new Date(8639968443048000);
        this.datesDisabled = [];
        this.daysOfWeekDisabled = [];
        this.setStartDate(options.startDate);
        this.setEndDate(options.endDate);
        this.setDatesDisabled(options.datesDisabled);
        this.setDaysOfWeekDisabled(options.daysOfWeekDisabled);
        this.fillDow();
        this.showMode();

        this.show();
    };

    Datetimepicker.prototype = {
        constructor: Datetimepicker,

        show(e) {
            this.picker.show();
            this.height = this.element.outerHeight();

            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            this.element.trigger({
                type: 'show',
                date: this.date
            });
        },

        remove() {
            this.picker.remove();
            delete this.picker;
            delete this.element.data().datetimepicker;
        },

        getDate() {
            const d = this.getDate();

            if (d === null) {
                return null;
            }

            return new Date(d.getTime() + moment().utcOffset() * 60000);
        },

        getUTCDate() {
            return this.date;
        },

        setDate(d) {
            this.setUTCDate(d);
        },

        setUTCDate(d) {
            if (d >= this.startDate && d <= this.endDate) {
                this.date = d;
                this.setValue();
                this.viewDate = this.date;
                this.fill();
            } else {
                this.element.trigger({
                    type: 'outOfRange',
                    date: d,
                    startDate: this.startDate,
                    endDate: this.endDate
                });
            }
        },

        setFormat(format) {
            this.format = DPGlobal.parseFormat(format, this.formatType);
            let element;

            if (element && element.val()) {
                this.setValue();
            }
        },

        setValue() {
            this.element.data('date', this.getFormattedDate());
        },

        getFormattedDate(format = this.format) {
            return DPGlobal.formatDate(this.date, format, this.language, this.formatType, this.timezone);
        },

        setStartDate(startDate) {
            this.startDate = startDate || this.startDate;
            if (this.startDate.valueOf() !== 8639968443048000) {
                this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language, this.formatType, this.timezone);
            }
        },

        setEndDate(endDate) {
            this.endDate = endDate || this.endDate;
            if (this.endDate.valueOf() !== 8639968443048000) {
                this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language, this.formatType, this.timezone);
            }
        },

        setDatesDisabled(datesDisabled) {
            this.datesDisabled = datesDisabled || [];
            if (!$.isArray(this.datesDisabled)) {
                this.datesDisabled = this.datesDisabled.split(/,\s*/);
            }
            const mThis = this;
            this.datesDisabled = $.map(this.datesDisabled, d => DPGlobal.parseDate(d, mThis.format, mThis.language, mThis.formatType, mThis.timezone).toDateString());
        },

        setTitle(selector, value) {
            return this.picker
                .find(selector)
                .find('th:eq(1)')
                .text(this.title === false ? value : this.title);
        },

        setDaysOfWeekDisabled(daysOfWeekDisabled) {
            this.daysOfWeekDisabled = daysOfWeekDisabled || [];
            if (!$.isArray(this.daysOfWeekDisabled)) {
                this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
            }
            this.daysOfWeekDisabled = $.map(this.daysOfWeekDisabled, d => parseInt(d, 10));
        },

        hour_minute: '^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]',

        update() {
            let date;
            let fromArgs = false;
            if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
                date = arguments[0];
                fromArgs = true;
            } else {
                date = this.element.find('input').val() || this.element.data('date') || new Date();
                if (typeof date === 'string') {
                    date = date.replace(/^\s+|\s+$/g, '');
                }
            }

            if (!date) {
                date = new Date();
                fromArgs = false;
            }

            if (typeof date === 'string') {
                if (new RegExp(this.hour_minute).test(date) || new RegExp(`${this.hour_minute}:[0-5][0-9]`).test(date)) {
                    date = this.getDate();
                }
            }

            this.date = DPGlobal.parseDate(date, this.format, this.language, this.formatType, this.timezone);

            if (fromArgs) this.setValue();

            if (this.date < this.startDate) {
                this.viewDate = new Date(this.startDate);
            } else if (this.date > this.endDate) {
                this.viewDate = new Date(this.endDate);
            } else {
                this.viewDate = new Date(this.date);
            }
            this.fill();
        },

        fillDow() {
            let dowCnt = this.weekStart;
            let html = '<tr>';
            while (dowCnt < this.weekStart + 7) {
                html += `<th class="dow">${dates[this.language].daysMin[dowCnt++ % 7]}</th>`;
            }
            html += '</tr>';
            this.picker.find('.datetimepicker-days thead').append(html);
        },

        fillMonths() {
            let html = '';
            const d = new Date(this.viewDate);
            for (let i = 0; i < 12; i++) {
                d.setMonth(i);
                const classes = this.onRenderMonth(d);
                html += `<span class="${classes.join(' ')}">${dates[this.language].monthsShort[i]}</span>`;
            }
            this.picker.find('.datetimepicker-months td').html(html);
        },

        fill() {
            const d = new Date(this.viewDate);
            let year = this.viewDate.getFullYear();
            let html = [];
            let classes;
            const month = this.viewDate.getMonth();
            const startYear = this.startDate.getFullYear();
            const startMonth = moment(this.startDate).month();
            const endYear = this.endDate.getFullYear();
            const endMonth = this.endDate.getMonth() + 1;
            const currentDate = new UTCDate(this.date.getFullYear(), moment(this.date).month(), moment(this.date).date()).valueOf();
            const today = new Date();

            this.setTitle('.datetimepicker-days', `${dates[this.language].months[month]} ${year}`);

            this.picker.find('tfoot th.today').text(dates[this.language].today || dates.en.today);

            this.updateNavArrows();
            this.fillMonths();
            const prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0);
            const day = moment(prevMonth).daysInMonth();
            prevMonth.setDate(day);
            prevMonth.setDate(day - ((prevMonth.getDay() - this.weekStart + 7) % 7));
            let nextMonth = new Date(prevMonth);
            nextMonth.setDate(nextMonth.getDate() + 42);
            nextMonth = nextMonth.valueOf();

            while (prevMonth.valueOf() < nextMonth) {
                const UTCDay = prevMonth.getDay();
                const UTCMonth = moment(prevMonth).month();
                const UTCFullYear = prevMonth.getFullYear();

                if (UTCDay === this.weekStart) {
                    html.push('<tr>');
                }

                classes = this.onRenderDay(prevMonth);
                if (UTCFullYear < year || (UTCFullYear === year && UTCMonth < month)) {
                    classes.push('old');
                } else if (UTCFullYear > year || (UTCFullYear === year && UTCMonth > month)) {
                    classes.push('new');
                }
                // Compare internal UTC date with local today, not UTC today
                if (UTCFullYear === today.getFullYear() && UTCMonth === moment().month() && prevMonth.getDate() === today.getDate()) {
                    classes.push('today');
                }
                if (prevMonth.valueOf() === currentDate) {
                    classes.push('active');
                }
                if (
                    prevMonth.valueOf() + 86400000 <= this.startDate ||
                    prevMonth.valueOf() > this.endDate ||
                    $.inArray(prevMonth.getDay(), this.daysOfWeekDisabled) !== -1 ||
                    $.inArray(prevMonth.toDateString(), this.datesDisabled) !== -1
                ) {
                    classes.push('disabled');
                }
                html.push(`<td class="${classes.join(' ')}">${prevMonth.getDate()}</td>`);
                if (UTCDay === this.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setDate(prevMonth.getDate() + 1);
            }
            this.picker
                .find('.datetimepicker-days tbody')
                .empty()
                .append(html.join(''));

            const currentYear = this.date.getFullYear();
            const months = this.setTitle('.datetimepicker-months', year)
                .end()
                .find('.month')
                .removeClass('active');
            if (currentYear === year) {
                // getMonths() returns 0 based, and we need to select the next one
                // To cater bootstrap 2 we don't need to select the next one
                months.eq(this.date.getMonth()).addClass('active');
            }
            if (year < startYear || year > endYear) {
                months.addClass('disabled');
            }
            if (year === startYear) {
                months.slice(0, startMonth).addClass('disabled');
            }
            if (year === endYear) {
                months.slice(endMonth).addClass('disabled');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            const yearCont = this.setTitle('.datetimepicker-years', `${year}-${year + 9}`)
                .end()
                .find('td');
            year -= 1;

            for (let i = -1; i < 11; i++) {
                d.setFullYear(year);
                classes = this.onRenderYear(d);
                if (i === -1 || i === 10) {
                    classes.push(old);
                }
                html += `<span class="${classes.join(' ')}">${year}</span>`;
                year += 1;
            }
            yearCont.html(html);
        },

        updateNavArrows() {
            const d = new Date(this.viewDate);
            const year = d.getFullYear();
            const month = d.getMonth();
            const day = d.getDate();
            const hour = d.getUTCHours();

            switch (this.viewMode) {
                case 0:
                    if (year <= this.startDate.getFullYear() && month <= this.startDate.getMonth() && day <= this.startDate.getDate() && hour <= this.startDate.getUTCHours()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getFullYear() && month >= this.endDate.getMonth() && day >= this.endDate.getDate() && hour >= this.endDate.getUTCHours()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 1:
                    if (year <= this.startDate.getFullYear() && month <= this.startDate.getMonth() && day <= this.startDate.getDate()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getFullYear() && month >= this.endDate.getMonth() && day >= this.endDate.getDate()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 2:
                    if (year <= this.startDate.getFullYear() && month <= this.startDate.getMonth()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getFullYear() && month >= this.endDate.getMonth()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 3:
                case 4:
                    if (year <= this.startDate.getFullYear()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getFullYear()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                default:
                    break;
            }
        },

        click(e) {
            e.stopPropagation();
            e.preventDefault();
            let target = $(e.target).closest('span, td, th, legend');
            if (target.is(`.${'glyphicon'}`)) {
                target = $(target)
                    .parent()
                    .closest('span, td, th, legend');
            }
            if (target.length === 1) {
                if (target.is('.disabled')) {
                    this.element.trigger({
                        type: 'outOfRange',
                        date: this.viewDate,
                        startDate: this.startDate,
                        endDate: this.endDate
                    });
                    return;
                }
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next': {
                                const dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 1:
                                        this.viewDate = this.moveDate(this.viewDate, dir);
                                        break;
                                    case 2:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        break;
                                    case 3:
                                    case 4:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        break;
                                    default:
                                        break;
                                }
                                this.fill();
                                this.element.trigger({
                                    type: `${target[0].className}:${this.convertViewModeText(this.viewMode)}`,
                                    date: this.viewDate,
                                    startDate: this.startDate,
                                    endDate: this.endDate
                                });
                                break;
                            }
                            case 'clear':
                                this.reset();
                                break;
                            case 'today': {
                                let date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate());

                                // Respect startDate and endDate.
                                if (date < this.startDate) date = this.startDate;
                                else if (date > this.endDate) date = this.endDate;

                                this.viewMode = this.startViewMode;
                                this.showMode(0);
                                this._setDate(date);
                                this.fill();
                                break;
                            }
                            default:
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            let year = this.viewDate.getFullYear();
                            let month = this.viewDate.getMonth();
                            let day = this.viewDate.getDate();

                            if (target.is('.month')) {
                                this.viewDate.setUTCDate(1);
                                month = target
                                    .parent()
                                    .find('span')
                                    .index(target);
                                day = this.viewDate.getDate();
                                this.viewDate.setMonth(month);
                                this.element.trigger({
                                    type: 'changeMonth',
                                    date: this.viewDate
                                });
                                if (this.viewSelect >= 3) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            } else if (target.is('.year')) {
                                this.viewDate.setUTCDate(1);
                                year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                this.element.trigger({
                                    type: 'changeYear',
                                    date: this.viewDate
                                });
                                if (this.viewSelect >= 4) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            }
                            if (this.viewMode !== 0) {
                                this.showMode(-1);
                                this.fill();
                            } else {
                                this.fill();
                            }
                        }
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            const day = parseInt(target.text(), 10) || 1;
                            let year = this.viewDate.getFullYear();
                            let month = this.viewDate.getMonth();

                            if (target.is('.old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if (target.is('.new')) {
                                if (month === 11) {
                                    month = 0;
                                    year += 1;
                                } else {
                                    month += 1;
                                }
                            }
                            this.viewDate.setUTCFullYear(year);
                            this.viewDate.setMonth(month, day);
                            this.element.trigger({
                                type: 'changeDay',
                                date: this.viewDate
                            });
                            if (this.viewSelect >= 2) {
                                this._setDate(moment({ year, month, day, hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate());
                            }
                        }
                        this.showMode(-1);
                        this.fill();
                        break;
                    default:
                        break;
                }
            }
        },

        _setDate(date, which) {
            if (!which || which === 'date') this.date = date;
            if (!which || which === 'view') this.viewDate = date;
            this.fill();
            this.setValue();

            this.element.trigger({
                type: 'changeDate',
                date: this.date
            });
            if (date === null) this.date = this.viewDate;
        },

        moveDate(date, dir) {
            if (!dir) return date;
            const new_date = new Date(date.valueOf());
            //dir = dir > 0 ? 1 : -1;
            new_date.setUTCDate(new_date.getDate() + dir);
            return new_date;
        },

        moveMonth(date, dir) {
            if (!dir) return date;
            let new_date = new Date(date.valueOf());
            let day = new_date.getDate();
            const month = new_date.getMonth();
            const mag = Math.abs(dir);
            let new_month;
            let test;

            dir = dir > 0 ? 1 : -1;
            if (mag === 1) {
                test =
                    dir === -1
                        ? // If going back one month, make sure month is not current month
                          // (eg, Mar 31 -> Feb 31 === Feb 28, not Mar 02)
                          function() {
                              return new_date.getMonth() === month;
                          }
                        : // If going forward one month, make sure month is as expected
                          // (eg, Jan 31 -> Feb 31 === Feb 28, not Mar 02)
                          function() {
                              return new_date.getMonth() !== new_month;
                          };
                new_month = month + dir;
                new_date.setMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11) new_month = (new_month + 12) % 12;
            } else {
                // For magnitudes >1, move one month at a time...
                for (
                    let i = 0;
                    i < mag;
                    i++ // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                ) {
                    new_date = this.moveMonth(new_date, dir);
                }
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getMonth();
                new_date.setUTCDate(day);
                test = function() {
                    return new_month !== new_date.getMonth();
                };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setMonth(new_month);
            }
            return new_date;
        },

        moveYear(date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        dateWithinRange(date) {
            return date >= this.startDate && date <= this.endDate;
        },

        keydown(e) {
            if (this.picker.is(':not(:visible)')) {
                if (e.keyCode === 27) {
                    // allow escape to hide and re-show picker
                    this.show();
                    return;
                }
                let dateChanged = false;
                let dir;
                let newDate;
                let newViewDate;
                switch (e.keyCode) {
                    case 27: // escape
                        e.preventDefault();
                        break;
                    case 37: // left
                    case 39: {
                        // right
                        dir = e.keyCode === 37 ? -1 : 1;
                        let viewMode = this.viewMode;
                        if (e.ctrlKey) {
                            viewMode += 2;
                        } else if (e.shiftKey) {
                            viewMode += 1;
                        }
                        if (viewMode === 4) {
                            newDate = this.moveYear(this.date, dir);
                            newViewDate = this.moveYear(this.viewDate, dir);
                        } else if (viewMode === 3) {
                            newDate = this.moveMonth(this.date, dir);
                            newViewDate = this.moveMonth(this.viewDate, dir);
                        } else if (viewMode === 2) {
                            newDate = this.moveDate(this.date, dir);
                            newViewDate = this.moveDate(this.viewDate, dir);
                        }
                        if (this.dateWithinRange(newDate)) {
                            this.date = newDate;
                            this.viewDate = newViewDate;
                            this.setValue();
                            this.update();
                            e.preventDefault();
                            dateChanged = true;
                        }
                        break;
                    }
                    case 38: // up
                    case 40: // down
                        dir = e.keyCode === 38 ? -1 : 1;
                        viewMode = this.viewMode;
                        if (e.ctrlKey) {
                            viewMode += 2;
                        } else if (e.shiftKey) {
                            viewMode += 1;
                        }
                        if (viewMode === 4) {
                            newDate = this.moveYear(this.date, dir);
                            newViewDate = this.moveYear(this.viewDate, dir);
                        } else if (viewMode === 3) {
                            newDate = this.moveMonth(this.date, dir);
                            newViewDate = this.moveMonth(this.viewDate, dir);
                        } else if (viewMode === 2) {
                            newDate = this.moveDate(this.date, dir * 7);
                            newViewDate = this.moveDate(this.viewDate, dir * 7);
                        }
                        if (this.dateWithinRange(newDate)) {
                            this.date = newDate;
                            this.viewDate = newViewDate;
                            this.setValue();
                            this.update();
                            e.preventDefault();
                            dateChanged = true;
                        }
                        break;
                    case 13: // enter
                        if (this.viewMode !== 0) {
                            this.showMode(-1);
                            this.fill();
                        } else {
                            this.fill();
                        }
                        e.preventDefault();
                        break;
                    default:
                        break;
                }
                if (dateChanged) {
                    let element;

                    if (element) {
                        element.change();
                    }
                    this.element.trigger({
                        type: 'changeDate',
                        date: this.getDate()
                    });
                }
            }
        },

        showMode(dir) {
            if (dir) {
                const newViewMode = Math.max(0, Math.min(DPGlobal.modes.length - 1, this.viewMode + dir));
                if (newViewMode >= this.minView && newViewMode <= this.maxView) {
                    this.element.trigger({
                        type: 'changeMode',
                        date: this.viewDate,
                        oldViewMode: this.viewMode,
                        newViewMode
                    });

                    this.viewMode = newViewMode;
                }
            }

            this.picker
                .find('>div')
                .hide()
                .filter(`.datetimepicker-${DPGlobal.modes[this.viewMode].clsName}`)
                .show();
        },

        reset() {
            this._setDate(null, 'date');
        },

        convertViewModeText(viewMode) {
            switch (viewMode) {
                case 4:
                    return 'decade';
                case 3:
                    return 'year';
                case 2:
                    return 'month';
                case 1:
                    return 'day';
                default:
                    break;
            }
        }
    };

    if (!$.fn) {
        $.fn = {};
    }
    $.fn.datetimepicker = function(option) {
        const args = Array.apply(null, arguments);
        args.shift();
        let internal_return;
        this.each(function() {
            const $this = $(this);
            let data = $this.data('datetimepicker');
            const options = typeof option === 'object' && option;
            if (!data) {
                $this.data('datetimepicker', (data = new Datetimepicker(this, $.extend({}, $.fn.datetimepicker.defaults, options))));
            }
            if (typeof option === 'string' && typeof data[option] === 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined) {
                    return false;
                }
            }
        });
        if (internal_return !== undefined) return internal_return;
        return this;
    };

    $.fn.datetimepicker.defaults = {};
    $.fn.datetimepicker.Constructor = Datetimepicker;
    dates = dates || {
        en: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            meridiem: ['am', 'pm'],
            suffix: ['st', 'nd', 'rd', 'th'],
            today: 'Today',
            clear: 'Clear'
        }
    };

    $.fn.datetimepicker.dates = dates;

    DPGlobal = {
        modes: [
            {
                clsName: 'minutes',
                navFnc: 'Hours',
                navStep: 1
            },
            {
                clsName: 'hours',
                navFnc: 'Date',
                navStep: 1
            },
            {
                clsName: 'days',
                navFnc: 'Month',
                navStep: 1
            },
            {
                clsName: 'months',
                navFnc: 'FullYear',
                navStep: 1
            },
            {
                clsName: 'years',
                navFnc: 'FullYear',
                navStep: 10
            }
        ],
        isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },
        getDaysInMonth(year, month) {
            return [31, DPGlobal.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        getDefaultFormat(type, field) {
            if (type === 'standard') {
                if (field === 'input') {
                    return 'yyyy-mm-dd hh:ii';
                }
                return 'yyyy-mm-dd hh:ii:ss';
            } else if (type === 'php') {
                if (field === 'input') {
                    return 'Y-m-d H:i';
                }
                return 'Y-m-d H:i:s';
            }
            throw new Error('Invalid format type.');
        },
        validParts(type) {
            if (type === 'standard') {
                return /t|hh?|HH?|p|P|z|Z|ii?|ss?|dd?|DD?|mm?|MM?|yy(?:yy)?/g;
            } else if (type === 'php') {
                return /[dDjlNwzFmMnStyYaABgGhHis]/g;
            }
            throw new Error('Invalid format type.');
        },
        nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g,
        parseFormat(format, type) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            const separators = format.replace(this.validParts(type), '\0').split('\0');
            const parts = format.match(this.validParts(type));
            if (!separators || !separators.length || !parts || parts.length === 0) {
                throw new Error('Invalid date format.');
            }
            return { separators, parts };
        },
        parseDate(date, format, language, type, timezone) {
            let part;
            let parts;
            if (date instanceof Date) {
                const dateUTC = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
                dateUTC.setMilliseconds(0);
                return dateUTC;
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd', type);
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd hh:ii', type);
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd hh:ii:ss', type);
            }
            if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
                const part_re = /([-+]\d+)([dmwy])/;
                parts = date.match(/([-+]\d+)([dmwy])/g);
                let dir;
                date = new Date();
                for (let i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getDate() + dir);
                            break;
                        case 'm':
                            date = Datetimepicker.prototype.moveMonth.call(Datetimepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datetimepicker.prototype.moveYear.call(Datetimepicker.prototype, date, dir);
                            break;
                        default:
                            break;
                    }
                }
                return UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);
            }
            parts = (date && date.toString().match(this.nonpunctuation)) || [];
            var date = new Date(0, 0, 0, 0, 0, 0, 0);
            const parsed = {};
            const setters_order = ['hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'D', 'DD', 'd', 'dd', 'H', 'HH', 'p', 'P', 'z', 'Z'];
            const setters_map = {
                hh(d, v) {
                    return d.setUTCHours(v);
                },
                h(d, v) {
                    return d.setUTCHours(v);
                },
                HH(d, v) {
                    return d.setUTCHours(v === 12 ? 0 : v);
                },
                H(d, v) {
                    return d.setUTCHours(v === 12 ? 0 : v);
                },
                ii(d, v) {
                    return d.setUTCMinutes(v);
                },
                i(d, v) {
                    return d.setUTCMinutes(v);
                },
                ss(d, v) {
                    return d.setUTCSeconds(v);
                },
                s(d, v) {
                    return d.setUTCSeconds(v);
                },
                yyyy(d, v) {
                    return d.setUTCFullYear(v);
                },
                yy(d, v) {
                    return d.setUTCFullYear(2000 + v);
                },
                m(d, v) {
                    v -= 1;
                    while (v < 0) v += 12;
                    v %= 12;
                    d.setMonth(v);
                    while (d.getMonth() !== v) {
                        if (isNaN(d.getMonth())) return d;
                        d.setUTCDate(d.getDate() - 1);
                    }
                    return d;
                },
                d(d, v) {
                    return d.setUTCDate(v);
                },
                p(d, v) {
                    return d.setUTCHours(v === 1 ? d.getHours() + 12 : d.getHours());
                },
                z() {
                    return timezone;
                }
            };
            let val;
            let filtered;
            setters_map.M = setters_map.MM = setters_map.mm = setters_map.m;
            setters_map.dd = setters_map.d;
            setters_map.P = setters_map.p;
            setters_map.Z = setters_map.z;
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            if (parts.length === format.parts.length) {
                for (let i = 0, cnt = format.parts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10);
                    part = format.parts[i];
                    if (isNaN(val)) {
                        switch (part) {
                            case 'MM':
                                filtered = $(dates[language].months).filter(() => {
                                    const m = this.slice(0, parts[i].length);
                                    const p = parts[i].slice(0, m.length);

                                    return m === p;
                                });
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(() => {
                                    const m = this.slice(0, parts[i].length);
                                    const p = parts[i].slice(0, m.length);

                                    return m.toLowerCase() === p.toLowerCase();
                                });
                                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                break;
                            case 'p':
                            case 'P':
                                val = $.inArray(parts[i].toLowerCase(), dates[language].meridiem);
                                break;
                            case 'z':
                            case 'Z':
                                return timezone;
                            default:
                                break;
                        }
                    }
                    parsed[part] = val;
                }
                for (let i = 0, s; i < setters_order.length; i++) {
                    s = setters_order[i];
                    if (s in parsed && !isNaN(parsed[s])) setters_map[s](date, parsed[s]);
                }
            }
            return date;
        },
        formatDate(date, format, language, type, timezone) {
            if (date === null) {
                return '';
            }
            let val;
            if (type === 'standard') {
                val = {
                    t: date.getTime(),
                    // year
                    yy: date
                        .getFullYear()
                        .toString()
                        .substring(2),
                    yyyy: date.getFullYear(),
                    // month
                    m: date.getMonth() + 1,
                    M: dates[language].monthsShort[date.getMonth()],
                    MM: dates[language].months[date.getMonth()],
                    // day
                    d: date.getDate(),
                    D: dates[language].daysShort[date.getDay()],
                    DD: dates[language].days[date.getDay()],
                    p: dates[language].meridiem.length === 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : '',
                    // hour
                    h: date.getUTCHours(),
                    // minute
                    i: date.getUTCMinutes(),
                    // second
                    s: date.getUTCSeconds(),
                    // timezone
                    z: timezone
                };

                if (dates[language].meridiem.length === 2) {
                    val.H = val.h % 12 === 0 ? 12 : val.h % 12;
                } else {
                    val.H = val.h;
                }
                val.HH = (val.H < 10 ? '0' : '') + val.H;
                val.P = val.p.toUpperCase();
                val.Z = val.z;
                val.hh = (val.h < 10 ? '0' : '') + val.h;
                val.ii = (val.i < 10 ? '0' : '') + val.i;
                val.ss = (val.s < 10 ? '0' : '') + val.s;
                val.dd = (val.d < 10 ? '0' : '') + val.d;
                val.mm = (val.m < 10 ? '0' : '') + val.m;
            } else if (type === 'php') {
                // php format
                val = {
                    // year
                    y: date
                        .getFullYear()
                        .toString()
                        .substring(2),
                    Y: date.getFullYear(),
                    // month
                    F: dates[language].months[date.getMonth()],
                    M: dates[language].monthsShort[date.getMonth()],
                    n: date.getMonth() + 1,
                    t: DPGlobal.getDaysInMonth(date.getFullYear(), date.getMonth()),
                    // day
                    j: date.getDate(),
                    l: dates[language].days[date.getDay()],
                    D: dates[language].daysShort[date.getDay()],
                    w: date.getDay(), // 0 -> 6
                    N: date.getDay() === 0 ? 7 : date.getDay(), // 1 -> 7
                    S: date.getDate() % 10 <= dates[language].suffix.length ? dates[language].suffix[(date.getDate() % 10) - 1] : '',
                    // hour
                    a: dates[language].meridiem.length === 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : '',
                    g: date.getUTCHours() % 12 === 0 ? 12 : date.getUTCHours() % 12,
                    G: date.getUTCHours(),
                    // minute
                    i: date.getUTCMinutes(),
                    // second
                    s: date.getUTCSeconds()
                };
                val.m = (val.n < 10 ? '0' : '') + val.n;
                val.d = (val.j < 10 ? '0' : '') + val.j;
                val.A = val.a.toString().toUpperCase();
                val.h = (val.g < 10 ? '0' : '') + val.g;
                val.H = (val.G < 10 ? '0' : '') + val.G;
                val.i = (val.i < 10 ? '0' : '') + val.i;
                val.s = (val.s < 10 ? '0' : '') + val.s;
            } else {
                throw new Error('Invalid format type.');
            }
            const newDate = [];
            const seps = $.extend([], format.separators);

            for (let i = 0, cnt = format.parts.length; i < cnt; i++) {
                if (seps.length) {
                    newDate.push(seps.shift());
                }
                newDate.push(val[format.parts[i]]);
            }
            if (seps.length) {
                newDate.push(seps.shift());
            }
            return newDate.join('');
        },

        convertViewMode(viewMode) {
            switch (viewMode) {
                case 4:
                case 'decade':
                    return (viewMode = 4);
                case 3:
                case 'year':
                    return (viewMode = 3);
                case 2:
                case 'month':
                    return (viewMode = 2);
                case 1:
                case 'day':
                    return (viewMode = 1);
                default:
                    break;
            }
        },
        headTemplate:
            '<thead>' +
            '<tr>' +
            '<th class="prev"><i class="glyphicon icon-arrow-left"/></th>' +
            '<th colspan="5" class="switch"></th>' +
            '<th class="next"><i class="glyphicon icon-arrow-right"/></th>' +
            '</tr>' +
            '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>'
    };
    DPGlobal.template = `<div class="datetimepicker">
<div class="datetimepicker-days">
<table class=" table-condensed">${DPGlobal.headTemplate}<tbody>
</tbody>${DPGlobal.footTemplate}</table>
</div>
<div class="datetimepicker-months">
<table class="table-condensed">${DPGlobal.headTemplate}${DPGlobal.contTemplate}${DPGlobal.footTemplate}</table>
</div>
<div class="datetimepicker-years">
<table class="table-condensed">${DPGlobal.headTemplate}${DPGlobal.contTemplate}${DPGlobal.footTemplate}</table>
</div>
</div>`;
    $.fn.datetimepicker.DPGlobal = DPGlobal;

    /* DATETIMEPICKER NO CONFLICT
     * =================== */

    $.fn.datetimepicker.noConflict = function() {
        $.fn.datetimepicker = old;
        return this;
    };

    /* DATETIMEPICKER DATA-API
     * ================== */

    if (typeof $ === 'function') {
        $(document).on('focus.datetimepicker.data-api click.datetimepicker.data-api', '[data-provide="datetimepicker"]', function(e) {
            const $this = $(this);
            if ($this.data('datetimepicker')) return;
            e.preventDefault();
            // component click requires us to explicitly show it
            $this.datetimepicker('show');
        });
        $(() => {
            $('[data-provide="datetimepicker-inline"]').datetimepicker();
        });
    }
}
