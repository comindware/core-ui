/*eslint-ignore*/

(function(factory) {
    /*eslint-ignore*/
    if (typeof define === 'function' && define.amd) define(['jquery'], factory);
    else if (typeof exports === 'object') factory(require('jquery'));
    else factory(jQuery);
})($ => {
    let DPGlobal;
    let dates;
    /*eslint-ignore*/
    const old = $.fn.datetimepicker;

    // Add timezone abbreviation support for ie6+, Chrome, Firefox
    function timeZoneAbbreviation() {
        let abbreviation;
        const date = new Date().toString();
        let formattedStr;
        let matchedStrings;
        let ref;
        let str;

        formattedStr = ((ref = date.split('(')[1]) != null ? ref.slice(0, -1) : 0) || date.split(' ');
        if (formattedStr instanceof Array) {
            matchedStrings = [];
            for (let i = 0, len = formattedStr.length; i < len; i++) {
                str = formattedStr[i];
                if ((abbreviation = (ref = str.match(/\b[A-Z]+\b/)) !== null) ? ref[0] : 0) {
                    matchedStrings.push(abbreviation);
                }
            }
            formattedStr = matchedStrings.pop();
        }
        return formattedStr;
    }

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }

    // Picker object
    const Datetimepicker = function(element, options) {
        const that = this;

        this.element = $(element);

        // add container for single page application
        // when page switch the datetimepicker div will be removed also.
        this.container = options.container || 'body';

        this.language = options.language || this.element.data('date-language') || 'en';
        this.language = this.language in dates ? this.language : this.language.split('-')[0]; // fr-CA fallback to fr
        this.language = this.language in dates ? this.language : 'en';
        this.isRTL = dates[this.language].rtl || false;
        this.formatType = options.formatType || this.element.data('format-type') || 'standard';
        this.format = DPGlobal.parseFormat(
            options.format || this.element.data('date-format') || dates[this.language].format || DPGlobal.getDefaultFormat(this.formatType, 'input'),
            this.formatType
        );
        this.isInline = false;
        this.isVisible = false;
        this.isInput = this.element.is('input');
        this.fontAwesome = options.fontAwesome || this.element.data('font-awesome') || false;

        this.component = this.element.is('.date')
            ? this.element.find('.add-on .icon-th, .add-on .icon-time, .add-on .icon-calendar, .add-on .fa-calendar, .add-on .fa-clock-o').parent()
            : false;

        this.componentReset = this.element.is('.date') ? this.element.find('.add-on .icon-remove, .add-on .fa-times').parent() : false;

        this.hasInput = this.component && this.element.find('input').length;
        if (this.component && this.component.length === 0) {
            this.component = false;
        }
        this.linkField = options.linkField || this.element.data('link-field') || false;
        this.linkFormat = DPGlobal.parseFormat(options.linkFormat || this.element.data('link-format') || DPGlobal.getDefaultFormat(this.formatType, 'link'), this.formatType);
        this.minuteStep = 5;
        this.pickerPosition = options.pickerPosition || this.element.data('picker-position') || 'bottom-right';
        this.initialDate = options.initialDate || new Date();
        this.zIndex = options.zIndex || this.element.data('z-index') || undefined;
        this.title = typeof options.title === 'undefined' ? false : options.title;
        this.timezone = options.timezone || timeZoneAbbreviation();

        this.icons = {
            leftArrow: this.fontAwesome ? 'fa-arrow-left' : 'icon-arrow-left',
            rightArrow: this.fontAwesome ? 'fa-arrow-right' : 'icon-arrow-right'
        };
        this.icontype = this.fontAwesome ? 'fa' : 'glyphicon';

        this._attachEvents();

        this.clickedOutside = function(e) {
            // Clicked outside the datetimepicker, hide it
            if ($(e.target).closest('.datetimepicker').length === 0) {
                that.hide();
            }
        };

        this.formatViewType = 'datetime';
        if ('formatViewType' in options) {
            this.formatViewType = options.formatViewType;
        } else if ('formatViewType' in this.element.data()) {
            this.formatViewType = this.element.data('formatViewType');
        }

        this.minView = 0;
        if ('minView' in options) {
            this.minView = options.minView;
        } else if ('minView' in this.element.data()) {
            this.minView = this.element.data('min-view');
        }
        this.minView = DPGlobal.convertViewMode(this.minView);

        this.maxView = DPGlobal.modes.length - 1;
        if ('maxView' in options) {
            this.maxView = options.maxView;
        } else if ('maxView' in this.element.data()) {
            this.maxView = this.element.data('max-view');
        }
        this.maxView = DPGlobal.convertViewMode(this.maxView);

        this.wheelViewModeNavigation = false;
        if ('wheelViewModeNavigation' in options) {
            this.wheelViewModeNavigation = options.wheelViewModeNavigation;
        } else if ('wheelViewModeNavigation' in this.element.data()) {
            this.wheelViewModeNavigation = this.element.data('view-mode-wheel-navigation');
        }

        this.wheelViewModeNavigationInverseDirection = false;

        if ('wheelViewModeNavigationInverseDirection' in options) {
            this.wheelViewModeNavigationInverseDirection = options.wheelViewModeNavigationInverseDirection;
        } else if ('wheelViewModeNavigationInverseDirection' in this.element.data()) {
            this.wheelViewModeNavigationInverseDirection = this.element.data('view-mode-wheel-navigation-inverse-dir');
        }

        this.wheelViewModeNavigationDelay = 100;
        if ('wheelViewModeNavigationDelay' in options) {
            this.wheelViewModeNavigationDelay = options.wheelViewModeNavigationDelay;
        } else if ('wheelViewModeNavigationDelay' in this.element.data()) {
            this.wheelViewModeNavigationDelay = this.element.data('view-mode-wheel-navigation-delay');
        }

        this.startViewMode = 2;
        if ('startView' in options) {
            this.startViewMode = options.startView;
        } else if ('startView' in this.element.data()) {
            this.startViewMode = this.element.data('start-view');
        }
        this.startViewMode = DPGlobal.convertViewMode(this.startViewMode);
        this.viewMode = this.startViewMode;

        this.viewSelect = this.minView;
        if ('viewSelect' in options) {
            this.viewSelect = options.viewSelect;
        } else if ('viewSelect' in this.element.data()) {
            this.viewSelect = this.element.data('view-select');
        }
        this.viewSelect = DPGlobal.convertViewMode(this.viewSelect);

        this.forceParse = true;
        if ('forceParse' in options) {
            this.forceParse = options.forceParse;
        } else if ('dateForceParse' in this.element.data()) {
            this.forceParse = this.element.data('date-force-parse');
        }

        let template = DPGlobal.template;

        while (template.indexOf('{iconType}') !== -1) {
            template = template.replace('{iconType}', this.icontype);
        }
        while (template.indexOf('{leftArrow}') !== -1) {
            template = template.replace('{leftArrow}', this.icons.leftArrow);
        }
        while (template.indexOf('{rightArrow}') !== -1) {
            template = template.replace('{rightArrow}', this.icons.rightArrow);
        }
        this.picker = $(template)
            .appendTo(this.isInline ? this.element : this.container)
            .on({
                click: $.proxy(this.click, this),
                mousedown: $.proxy(this.mousedown, this)
            });

        if (this.wheelViewModeNavigation) {
            if ($.fn.mousewheel) {
                this.picker.on({ mousewheel: $.proxy(this.mousewheel, this) });
            } else {
                console.log('Mouse Wheel event is not supported. Please include the jQuery Mouse Wheel plugin before enabling this option');
            }
        }

        if (this.isInline) {
            this.picker.addClass('datetimepicker-inline');
        } else {
            this.picker.addClass(`datetimepicker-dropdown-${this.pickerPosition} dropdown-menu`);
        }
        if (this.isRTL) {
            this.picker.addClass('datetimepicker-rtl');
            const selector = '.prev i, .next i';
            this.picker.find(selector).toggleClass(`${this.icons.leftArrow} ${this.icons.rightArrow}`);
        }

        $(document).on('mousedown touchend', this.clickedOutside);

        this.autoclose = false;
        if ('autoclose' in options) {
            this.autoclose = options.autoclose;
        } else if ('dateAutoclose' in this.element.data()) {
            this.autoclose = this.element.data('date-autoclose');
        }

        this.keyboardNavigation = true;
        if ('keyboardNavigation' in options) {
            this.keyboardNavigation = options.keyboardNavigation;
        } else if ('dateKeyboardNavigation' in this.element.data()) {
            this.keyboardNavigation = this.element.data('date-keyboard-navigation');
        }

        this.todayBtn = options.todayBtn || this.element.data('date-today-btn') || false;
        this.clearBtn = options.clearBtn || this.element.data('date-clear-btn') || false;
        this.todayHighlight = options.todayHighlight || this.element.data('date-today-highlight') || false;

        this.weekStart = 0;
        if (typeof options.weekStart !== 'undefined') {
            this.weekStart = options.weekStart;
        } else if (typeof this.element.data('date-weekstart') !== 'undefined') {
            this.weekStart = this.element.data('date-weekstart');
        } else if (typeof dates[this.language].weekStart !== 'undefined') {
            this.weekStart = dates[this.language].weekStart;
        }
        this.weekStart = this.weekStart % 7;
        this.weekEnd = (this.weekStart + 6) % 7;
        this.onRenderDay = function(date) {
            let render = (options.onRenderDay ||
                function() {
                    return [];
                })(date);
            if (typeof render === 'string') {
                render = [render];
            }
            const res = ['day'];
            return res.concat(render || []);
        };
        this.onRenderHour = function(date) {
            let render = (options.onRenderHour ||
                function() {
                    return [];
                })(date);
            const res = ['hour'];
            if (typeof render === 'string') {
                render = [render];
            }
            return res.concat(render || []);
        };
        this.onRenderMinute = function(date) {
            let render = (options.onRenderMinute ||
                function() {
                    return [];
                })(date);
            const res = ['minute'];
            if (typeof render === 'string') {
                render = [render];
            }
            if (date < this.startDate || date > this.endDate) {
                res.push('disabled');
            } else if (Math.floor(this.date.getUTCMinutes() / this.minuteStep) === Math.floor(date.getUTCMinutes() / this.minuteStep)) {
                res.push('active');
            }
            return res.concat(render || []);
        };
        this.onRenderYear = function(date) {
            let render = (options.onRenderYear ||
                function() {
                    return [];
                })(date);
            const res = ['year'];
            if (typeof render === 'string') {
                render = [render];
            }
            if (this.date.getUTCFullYear() === date.getUTCFullYear()) {
                res.push('active');
            }
            const currentYear = date.getUTCFullYear();
            const endYear = this.endDate.getUTCFullYear();
            if (date < this.startDate || currentYear > endYear) {
                res.push('disabled');
            }
            return res.concat(render || []);
        };
        this.onRenderMonth = function(date) {
            let render = (options.onRenderMonth ||
                function() {
                    return [];
                })(date);
            const res = ['month'];
            if (typeof render === 'string') {
                render = [render];
            }
            return res.concat(render || []);
        };
        this.startDate = new Date(-8639968443048000);
        this.endDate = new Date(8639968443048000);
        this.datesDisabled = [];
        this.daysOfWeekDisabled = [];
        this.setStartDate(options.startDate || this.element.data('date-startdate'));
        this.setEndDate(options.endDate || this.element.data('date-enddate'));
        this.setDatesDisabled(options.datesDisabled || this.element.data('date-dates-disabled'));
        this.setDaysOfWeekDisabled(options.daysOfWeekDisabled || this.element.data('date-days-of-week-disabled'));
        this.setMinutesDisabled(options.minutesDisabled || this.element.data('date-minute-disabled'));
        this.setHoursDisabled(options.hoursDisabled || this.element.data('date-hour-disabled'));
        this.fillDow();
        this.fillMonths();
        this.update();
        this.showMode();

        if (this.isInline) {
            this.show();
        }
    };

    Datetimepicker.prototype = {
        constructor: Datetimepicker,

        _events: [],
        _attachEvents() {
            this._detachEvents();
            if (this.isInput) {
                // single input
                this._events = [
                    [
                        this.element,
                        {
                            focus: $.proxy(this.show, this),
                            keyup: $.proxy(this.update, this),
                            keydown: $.proxy(this.keydown, this)
                        }
                    ]
                ];
            } else if (this.component && this.hasInput) {
                // component: input + button
                this._events = [
                    // For components that are not readonly, allow keyboard nav
                    [
                        this.element.find('input'),
                        {
                            focus: $.proxy(this.show, this),
                            keyup: $.proxy(this.update, this),
                            keydown: $.proxy(this.keydown, this)
                        }
                    ],
                    [
                        this.component,
                        {
                            click: $.proxy(this.show, this)
                        }
                    ]
                ];
                if (this.componentReset) {
                    this._events.push([this.componentReset, { click: $.proxy(this.reset, this) }]);
                }
            } else if (this.element.is('div')) {
                // inline datetimepicker
                this.isInline = true;
            } else {
                this._events = [
                    [
                        this.element,
                        {
                            click: $.proxy(this.show, this)
                        }
                    ]
                ];
            }
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.on(ev);
            }
        },

        _detachEvents() {
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.off(ev);
            }
            this._events = [];
        },

        show(e) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            if (this.forceParse) {
                this.update();
            }
            this.place();
            $(window).on('resize', $.proxy(this.place, this));
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.isVisible = true;
            this.element.trigger({
                type: 'show',
                date: this.date
            });
        },

        hide() {
            if (!this.isVisible) return;
            if (this.isInline) return;
            this.picker.hide();
            $(window).off('resize', this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                $(document).off('mousedown', this.hide);
            }

            if (this.forceParse && ((this.isInput && this.element.val()) || (this.hasInput && this.element.find('input').val()))) this.setValue();
            this.isVisible = false;
            this.element.trigger({
                type: 'hide',
                date: this.date
            });
        },

        remove() {
            this._detachEvents();
            $(document).off('mousedown', this.clickedOutside);
            this.picker.remove();
            delete this.picker;
            delete this.element.data().datetimepicker;
        },

        getDate() {
            const d = this.getUTCDate();
            if (d === null) {
                return null;
            }
            return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
        },

        getUTCDate() {
            return this.date;
        },

        getInitialDate() {
            return this.initialDate;
        },

        setInitialDate(initialDate) {
            this.initialDate = initialDate;
        },

        setDate(d) {
            this.setUTCDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000));
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
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element && element.val()) {
                this.setValue();
            }
        },

        setValue() {
            const formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted);
                }
                this.element.data('date', formatted);
            } else {
                this.element.val(formatted);
            }
            if (this.linkField) {
                $(`#${this.linkField}`).val(this.getFormattedDate(this.linkFormat));
            }
        },

        getFormattedDate(format = this.format) {
            return DPGlobal.formatDate(this.date, format, this.language, this.formatType, this.timezone);
        },

        setStartDate(startDate) {
            this.startDate = startDate || this.startDate;
            if (this.startDate.valueOf() !== 8639968443048000) {
                this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language, this.formatType, this.timezone);
            }
            this.update();
            this.updateNavArrows();
        },

        setEndDate(endDate) {
            this.endDate = endDate || this.endDate;
            if (this.endDate.valueOf() !== 8639968443048000) {
                this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language, this.formatType, this.timezone);
            }
            this.update();
            this.updateNavArrows();
        },

        setDatesDisabled(datesDisabled) {
            this.datesDisabled = datesDisabled || [];
            if (!$.isArray(this.datesDisabled)) {
                this.datesDisabled = this.datesDisabled.split(/,\s*/);
            }
            const mThis = this;
            this.datesDisabled = $.map(this.datesDisabled, d => DPGlobal.parseDate(d, mThis.format, mThis.language, mThis.formatType, mThis.timezone).toDateString());
            this.update();
            this.updateNavArrows();
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
            this.update();
            this.updateNavArrows();
        },

        setMinutesDisabled(minutesDisabled) {
            this.minutesDisabled = minutesDisabled || [];
            if (!$.isArray(this.minutesDisabled)) {
                this.minutesDisabled = this.minutesDisabled.split(/,\s*/);
            }
            this.minutesDisabled = $.map(this.minutesDisabled, d => parseInt(d, 10));
            this.update();
            this.updateNavArrows();
        },

        setHoursDisabled(hoursDisabled) {
            this.hoursDisabled = hoursDisabled || [];
            if (!$.isArray(this.hoursDisabled)) {
                this.hoursDisabled = this.hoursDisabled.split(/,\s*/);
            }
            this.hoursDisabled = $.map(this.hoursDisabled, d => parseInt(d, 10));
            this.update();
            this.updateNavArrows();
        },

        place() {
            if (this.isInline) return;

            if (!this.zIndex) {
                let index_highest = 0;
                $('div').each(function() {
                    const index_current = parseInt($(this).css('zIndex'), 10);
                    if (index_current > index_highest) {
                        index_highest = index_current;
                    }
                });
                this.zIndex = index_highest + 10;
            }

            let offset;
            let top;
            let left;
            let containerOffset;
            if (this.container instanceof $) {
                containerOffset = this.container.offset();
            } else {
                containerOffset = $(this.container).offset();
            }

            if (this.component) {
                offset = this.component.offset();
                left = offset.left;
                if (this.pickerPosition === 'bottom-left' || this.pickerPosition === 'top-left') {
                    left += this.component.outerWidth() - this.picker.outerWidth();
                }
            } else {
                offset = this.element.offset();
                left = offset.left;
                if (this.pickerPosition === 'bottom-left' || this.pickerPosition === 'top-left') {
                    left += this.element.outerWidth() - this.picker.outerWidth();
                }
            }

            const bodyWidth = document.body.clientWidth || window.innerWidth;
            if (left + 220 > bodyWidth) {
                left = bodyWidth - 220;
            }

            if (this.pickerPosition === 'top-left' || this.pickerPosition === 'top-right') {
                top = offset.top - this.picker.outerHeight();
            } else {
                top = offset.top + this.height;
            }

            top -= containerOffset.top;
            left -= containerOffset.left;

            this.picker.css({
                top,
                left,
                zIndex: this.zIndex
            });
        },

        hour_minute: '^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]',

        update() {
            let date;
            let fromArgs = false;
            if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
                date = arguments[0];
                fromArgs = true;
            } else {
                date = (this.isInput ? this.element.val() : this.element.find('input').val()) || this.element.data('date') || this.initialDate;
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
                d.setUTCMonth(i);
                const classes = this.onRenderMonth(d);
                html += `<span class="${classes.join(' ')}">${dates[this.language].monthsShort[i]}</span>`;
            }
            this.picker.find('.datetimepicker-months td').html(html);
        },

        fill() {
            if (!this.date || !this.viewDate) {
                return;
            }
            let d = new Date(this.viewDate);
            let year = d.getUTCFullYear();
            const month = d.getUTCMonth();
            const dayMonth = d.getUTCDate();
            const hours = d.getUTCHours();
            const startYear = this.startDate.getUTCFullYear();
            const startMonth = this.startDate.getUTCMonth();
            const endYear = this.endDate.getUTCFullYear();
            const endMonth = this.endDate.getUTCMonth() + 1;
            const currentDate = new UTCDate(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()).valueOf();
            const today = new Date();

            this.setTitle('.datetimepicker-days', `${dates[this.language].months[month]} ${year}`);

            this.picker
                .find('tfoot th.today')
                .text(dates[this.language].today || dates.en.today)
                .toggle(this.todayBtn !== false);
            this.picker
                .find('tfoot th.clear')
                .text(dates[this.language].clear || dates.en.clear)
                .toggle(this.clearBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            let prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0);
            let day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7) % 7);
            let nextMonth = new Date(prevMonth);
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            let html = [];
            let classes;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() === this.weekStart) {
                    html.push('<tr>');
                }
                classes = this.onRenderDay(prevMonth);
                if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() === year && prevMonth.getUTCMonth() < month)) {
                    classes.push('old');
                } else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() === year && prevMonth.getUTCMonth() > month)) {
                    classes.push('new');
                }
                // Compare internal UTC date with local today, not UTC today
                if (
                    this.todayHighlight
                    && prevMonth.getUTCFullYear() === today.getFullYear()
                    && prevMonth.getUTCMonth() === today.getMonth()
                    && prevMonth.getUTCDate() === today.getDate()
                ) {
                    classes.push('today');
                }
                if (prevMonth.valueOf() === currentDate) {
                    classes.push('active');
                }
                if (
                    prevMonth.valueOf() + 86400000 <= this.startDate
                    || prevMonth.valueOf() > this.endDate
                    || $.inArray(prevMonth.getUTCDay(), this.daysOfWeekDisabled) !== -1
                    || $.inArray(prevMonth.toDateString(), this.datesDisabled) !== -1
                ) {
                    classes.push('disabled');
                }
                html.push(`<td class="${classes.join(' ')}">${prevMonth.getUTCDate()}</td>`);
                if (prevMonth.getUTCDay() === this.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker
                .find('.datetimepicker-days tbody')
                .empty()
                .append(html.join(''));

            html = [];
            let txt = '';
            const hoursDisabled = this.hoursDisabled || [];
            d = new Date(this.viewDate);
            for (var i = 0; i < 24; i++) {
                d.setUTCHours(i);
                classes = this.onRenderHour(d);
                if (hoursDisabled.indexOf(i) !== -1) {
                    classes.push('disabled');
                }
                const actual = UTCDate(year, month, dayMonth, i);
                // We want the previous hour for the startDate
                if (actual.valueOf() + 3600000 <= this.startDate || actual.valueOf() > this.endDate) {
                    classes.push('disabled');
                } else if (hours === i) {
                    classes.push('active');
                }
                txt = `${i}:00`;
                html.push(`<span class="${classes.join(' ')}">${txt}</span>`);
            }

            html = [];
            const minutesDisabled = this.minutesDisabled || [];
            d = new Date(this.viewDate);
            for (var i = 0; i < 60; i += this.minuteStep) {
                if (minutesDisabled.indexOf(i) !== -1) continue;
                d.setUTCMinutes(i);
                d.setUTCSeconds(0);
                classes = this.onRenderMinute(d);
                txt = `${i}:00`;
                html.push(`<span class="${classes.join(' ')}">${hours}:${i < 10 ? `0${i}` : i}</span>`);
            }

            const currentYear = this.date.getUTCFullYear();
            const months = this.setTitle('.datetimepicker-months', year)
                .end()
                .find('.month')
                .removeClass('active');
            if (currentYear === year) {
                // getUTCMonths() returns 0 based, and we need to select the next one
                // To cater bootstrap 2 we don't need to select the next one
                months.eq(this.date.getUTCMonth()).addClass('active');
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
            d = new Date(this.viewDate);
            for (var i = -1; i < 11; i++) {
                d.setUTCFullYear(year);
                classes = this.onRenderYear(d);
                if (i === -1 || i === 10) {
                    classes.push(old);
                }
                html += `<span class="${classes.join(' ')}">${year}</span>`;
                year += 1;
            }
            yearCont.html(html);
            this.place();
        },

        updateNavArrows() {
            const d = new Date(this.viewDate);
            const year = d.getUTCFullYear();
            const month = d.getUTCMonth();
            const day = d.getUTCDate();
            const hour = d.getUTCHours();

            switch (this.viewMode) {
                case 0:
                    if (
                        year <= this.startDate.getUTCFullYear()
                        && month <= this.startDate.getUTCMonth()
                        && day <= this.startDate.getUTCDate()
                        && hour <= this.startDate.getUTCHours()
                    ) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth() && day >= this.endDate.getUTCDate() && hour >= this.endDate.getUTCHours()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 1:
                    if (year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth() && day <= this.startDate.getUTCDate()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth() && day >= this.endDate.getUTCDate()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 2:
                    if (year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 3:
                case 4:
                    if (year <= this.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (year >= this.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                default:
                    break;
            }
        },

        mousewheel(e) {
            e.preventDefault();
            e.stopPropagation();

            if (this.wheelPause) {
                return;
            }

            this.wheelPause = true;

            const originalEvent = e.originalEvent;
            const delta = originalEvent.wheelDelta;
            let mode = delta > 0 ? 1 : delta === 0 ? 0 : -1;

            if (this.wheelViewModeNavigationInverseDirection) {
                mode = -mode;
            }

            this.showMode(mode);

            setTimeout(
                $.proxy(function() {
                    this.wheelPause = false;
                }, this),
                this.wheelViewModeNavigationDelay
            );
        },

        click(e) {
            e.stopPropagation();
            e.preventDefault();
            let target = $(e.target).closest('span, td, th, legend');
            if (target.is(`.${this.icontype}`)) {
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
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveHour(this.viewDate, dir);
                                        break;
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
                                }
                                this.fill();
                                this.element.trigger({
                                    type: `${target[0].className}:${this.convertViewModeText(this.viewMode)}`,
                                    date: this.viewDate,
                                    startDate: this.startDate,
                                    endDate: this.endDate
                                });
                                break;
                            case 'clear':
                                this.reset();
                                if (this.autoclose) {
                                    this.hide();
                                }
                                break;
                            case 'today':
                                var date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);

                                // Respect startDate and endDate.
                                if (date < this.startDate) date = this.startDate;
                                else if (date > this.endDate) date = this.endDate;

                                this.viewMode = this.startViewMode;
                                this.showMode(0);
                                this._setDate(date);
                                this.fill();
                                if (this.autoclose) {
                                    this.hide();
                                }
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            var year = this.viewDate.getUTCFullYear();
                            var month = this.viewDate.getUTCMonth();
                            var day = this.viewDate.getUTCDate();
                            var hours = this.viewDate.getUTCHours();
                            var minutes = this.viewDate.getUTCMinutes();
                            var seconds = this.viewDate.getUTCSeconds();

                            if (target.is('.month')) {
                                this.viewDate.setUTCDate(1);
                                month = target
                                    .parent()
                                    .find('span')
                                    .index(target);
                                day = this.viewDate.getUTCDate();
                                this.viewDate.setUTCMonth(month);
                                this.element.trigger({
                                    type: 'changeMonth',
                                    date: this.viewDate
                                });
                                if (this.viewSelect >= 3) {
                                    this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
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
                                    this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                                }
                            }
                            if (this.viewMode !== 0) {
                                var oldViewMode = this.viewMode;
                                this.showMode(-1);
                                this.fill();
                                if (oldViewMode === this.viewMode && this.autoclose) {
                                    this.hide();
                                }
                            } else {
                                this.fill();
                                if (this.autoclose) {
                                    this.hide();
                                }
                            }
                        }
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            var day = parseInt(target.text(), 10) || 1;
                            var year = this.viewDate.getUTCFullYear();
                            var month = this.viewDate.getUTCMonth();
                            var hours = this.viewDate.getUTCHours();
                            var minutes = this.viewDate.getUTCMinutes();
                            var seconds = this.viewDate.getUTCSeconds();

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
                            this.viewDate.setUTCMonth(month, day);
                            this.element.trigger({
                                type: 'changeDay',
                                date: this.viewDate
                            });
                            if (this.viewSelect >= 2) {
                                this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                            }
                        }
                        var oldViewMode = this.viewMode;
                        this.showMode(-1);
                        this.fill();
                        if (oldViewMode === this.viewMode && this.autoclose) {
                            this.hide();
                        }
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
            let element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
            }
            this.element.trigger({
                type: 'changeDate',
                date: this.getDate()
            });
            if (date === null) this.date = this.viewDate;
        },

        moveMinute(date, dir) {
            if (!dir) return date;
            const new_date = new Date(date.valueOf());
            //dir = dir > 0 ? 1 : -1;
            new_date.setUTCMinutes(new_date.getUTCMinutes() + dir * this.minuteStep);
            return new_date;
        },

        moveHour(date, dir) {
            if (!dir) return date;
            const new_date = new Date(date.valueOf());
            //dir = dir > 0 ? 1 : -1;
            new_date.setUTCHours(new_date.getUTCHours() + dir);
            return new_date;
        },

        moveDate(date, dir) {
            if (!dir) return date;
            const new_date = new Date(date.valueOf());
            //dir = dir > 0 ? 1 : -1;
            new_date.setUTCDate(new_date.getUTCDate() + dir);
            return new_date;
        },

        moveMonth(date, dir) {
            if (!dir) return date;
            let new_date = new Date(date.valueOf());
            let day = new_date.getUTCDate();
            const month = new_date.getUTCMonth();
            const mag = Math.abs(dir);
            let new_month;
            let test;

            dir = dir > 0 ? 1 : -1;
            if (mag === 1) {
                test
                    = dir === -1
                        ? // If going back one month, make sure month is not current month
                    // (eg, Mar 31 -> Feb 31 === Feb 28, not Mar 02)
                        function() {
                            return new_date.getUTCMonth() === month;
                        }
                        : // If going forward one month, make sure month is as expected
                    // (eg, Jan 31 -> Feb 31 === Feb 28, not Mar 02)
                        function() {
                            return new_date.getUTCMonth() !== new_month;
                        };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
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
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function() {
                    return new_month !== new_date.getUTCMonth();
                };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
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
                    {
                        this.show();
                    }
                    return;
                }
                let dateChanged = false;
                let dir;
                let newDate;
                let newViewDate;
                switch (e.keyCode) {
                    case 27: // escape
                        this.hide();
                        e.preventDefault();
                        break;
                    case 37: // left
                    case 39: // right
                        if (!this.keyboardNavigation) break;
                        dir = e.keyCode === 37 ? -1 : 1;
                        var viewMode = this.viewMode;
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
                        } else if (viewMode === 1) {
                            newDate = this.moveHour(this.date, dir);
                            newViewDate = this.moveHour(this.viewDate, dir);
                        } else if (viewMode === 0) {
                            newDate = this.moveMinute(this.date, dir);
                            newViewDate = this.moveMinute(this.viewDate, dir);
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
                    case 38: // up
                    case 40: // down
                        if (!this.keyboardNavigation) break;
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
                        } else if (viewMode === 1) {
                            newDate = this.moveHour(this.date, dir * 4);
                            newViewDate = this.moveHour(this.viewDate, dir * 4);
                        } else if (viewMode === 0) {
                            newDate = this.moveMinute(this.date, dir * 4);
                            newViewDate = this.moveMinute(this.viewDate, dir * 4);
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
                            const oldViewMode = this.viewMode;
                            this.showMode(-1);
                            this.fill();
                            if (oldViewMode === this.viewMode && this.autoclose) {
                                this.hide();
                            }
                        } else {
                            this.fill();
                            if (this.autoclose) {
                                this.hide();
                            }
                        }
                        e.preventDefault();
                        break;
                    case 9: // tab
                        this.hide();
                        break;
                    default:
                        break;
                }
                if (dateChanged) {
                    let element;
                    if (this.isInput) {
                        element = this.element;
                    } else if (this.component) {
                        element = this.element.find('input');
                    }
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
            /*
       vitalets: fixing bug of very special conditions:
       jquery 1.7.1 + webkit + show inline datetimepicker in bootstrap popover.
       Method show() does not set display css correctly and datetimepicker is not shown.
       Changed to .css('display', 'block') solve the problem.
       See https://github.com/vitalets/x-editable/issues/37

       In jquery 1.7.2+ everything works fine.
       */
            //this.picker.find('>div').hide().filter('.datetimepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
            this.picker
                .find('>div')
                .hide()
                .filter(`.datetimepicker-${DPGlobal.modes[this.viewMode].clsName}`)
                .css('display', 'block');
            this.updateNavArrows();
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
                case 0:
                    return 'hour';
                default:
                    break;
            }
        }
    };

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
    dates = $.fn.datetimepicker.dates = {
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
            return [31,
DPGlobal.isLeapYear(year) ? 29 : 28,
31,
30,
31,
30,
31,
31,
30,
31,
30,
31][month];
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
                for (var i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getUTCDate() + dir);
                            break;
                        case 'm':
                            date = Datetimepicker.prototype.moveMonth.call(Datetimepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getUTCDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datetimepicker.prototype.moveYear.call(Datetimepicker.prototype, date, dir);
                            break;
                        default:
                            break;
                    }
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), 0);
            }
            parts = (date && date.toString().match(this.nonpunctuation)) || [];
            var date = new Date(0, 0, 0, 0, 0, 0, 0);
            const parsed = {};
            const setters_order = ['hh',
'h',
'ii',
'i',
'ss',
's',
'yyyy',
'yy',
'M',
'MM',
'm',
'mm',
'D',
'DD',
'd',
'dd',
'H',
'HH',
'p',
'P',
'z',
'Z'];
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
                    d.setUTCMonth(v);
                    while (d.getUTCMonth() !== v) {
                        if (isNaN(d.getUTCMonth())) return d;
                        d.setUTCDate(d.getUTCDate() - 1);
                    }
                    return d;
                },
                d(d, v) {
                    return d.setUTCDate(v);
                },
                p(d, v) {
                    return d.setUTCHours(v === 1 ? d.getUTCHours() + 12 : d.getUTCHours());
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
                for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10);
                    part = format.parts[i];
                    if (isNaN(val)) {
                        switch (part) {
                            case 'MM':
                                filtered = $(dates[language].months).filter(function() {
                                    const m = this.slice(0, parts[i].length);
                                    const p = parts[i].slice(0, m.length);
                                    return m === p;
                                });
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(function() {
                                    let m = this.slice(0, parts[i].length),
                                        p = parts[i].slice(0, m.length);
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
                                timezone;
                                break;
                            default:
                                break;
                        }
                    }
                    parsed[part] = val;
                }
                for (var i = 0, s; i < setters_order.length; i++) {
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
                        .getUTCFullYear()
                        .toString()
                        .substring(2),
                    yyyy: date.getUTCFullYear(),
                    // month
                    m: date.getUTCMonth() + 1,
                    M: dates[language].monthsShort[date.getUTCMonth()],
                    MM: dates[language].months[date.getUTCMonth()],
                    // day
                    d: date.getUTCDate(),
                    D: dates[language].daysShort[date.getUTCDay()],
                    DD: dates[language].days[date.getUTCDay()],
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
                        .getUTCFullYear()
                        .toString()
                        .substring(2),
                    Y: date.getUTCFullYear(),
                    // month
                    F: dates[language].months[date.getUTCMonth()],
                    M: dates[language].monthsShort[date.getUTCMonth()],
                    n: date.getUTCMonth() + 1,
                    t: DPGlobal.getDaysInMonth(date.getUTCFullYear(), date.getUTCMonth()),
                    // day
                    j: date.getUTCDate(),
                    l: dates[language].days[date.getUTCDay()],
                    D: dates[language].daysShort[date.getUTCDay()],
                    w: date.getUTCDay(), // 0 -> 6
                    N: date.getUTCDay() === 0 ? 7 : date.getUTCDay(), // 1 -> 7
                    S: date.getUTCDate() % 10 <= dates[language].suffix.length ? dates[language].suffix[date.getUTCDate() % 10 - 1] : '',
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
            var date = [];
            const seps = $.extend([], format.separators);
            for (let i = 0, cnt = format.parts.length; i < cnt; i++) {
                if (seps.length) {
                    date.push(seps.shift());
                }
                date.push(val[format.parts[i]]);
            }
            if (seps.length) {
                date.push(seps.shift());
            }
            return date.join('');
        },
        convertViewMode(viewMode) {
            switch (viewMode) {
                case 4:
                case 'decade':
                    viewMode = 4;
                    break;
                case 3:
                case 'year':
                    viewMode = 3;
                    break;
                case 2:
                case 'month':
                    viewMode = 2;
                    break;
                case 1:
                case 'day':
                    viewMode = 1;
                    break;
                case 0:
                case 'hour':
                    viewMode = 0;
                    break;
                default:
                    break;
            }

            return viewMode;
        },
        headTemplate:
            '<thead>' +
            '<tr>' +
            '<th class="prev"><i class="{iconType} {leftArrow}"/></th>' +
            '<th colspan="5" class="switch"></th>' +
            '<th class="next"><i class="{iconType} {rightArrow}"/></th>' +
            '</tr>' +
            '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot>' + '<tr><th colspan="7" class="today"></th></tr>' + '<tr><th colspan="7" class="clear"></th></tr>' + '</tfoot>'
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
});
