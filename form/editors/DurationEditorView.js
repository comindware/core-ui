/**
 * Developer: Ksenia Kartvelishvili
 * Date: 26.12.2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _, Localizer, Handlebars */

define(['text!./templates/durationEditor.html', './base/BaseItemEditorView', 'module/lib', 'core/utils/utilsApi', 'core/services/LocalizationService' ],
    function (template, BaseItemEditorView, lib, utils, LocalizationService) {
        'use strict';

        var ws = ' ';
        var spaces = [
            '',
            ws,
            ws + ws,
            ws + ws + ws,
            ws + ws + ws + ws
        ];
        var focusedParts = [
            {
                text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS'),
                separator: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS.SEPARATORCHAR'),
                maxLength: 4
            },
            {
                text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS'),
                prefix: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS.PREFIX'),
                separator: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS.SEPARATORCHAR'),
                maxLength: 4
            },
            {
                text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES'),
                prefix: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES.PREFIX'),
                maxLength: 4
            }
        ];
        var format = function (v, full) {
            var val = !v ? (v === 0 ? '0' : '' ) : '' + v;
            if (val.length < this.length) {
                val = spaces[this.length - val.length] + val;
            }
            else if (val.length > this.length) {
                val = val.substring(val.length - this.length, this.length);
            }
            return (this.prefix || '') + (full ? val + this.text : val);
        };
        for (var i = 0; i < focusedParts.length; i++) {
            focusedParts[i].format = format;
        }

        var defaultOptions = {
            max: null,
            min: 0,
            step: 1,
            page: 10,
            incremental: true,
            workHours: 8,
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true
        };

        var keyCode = utils.keyCode;

        Backbone.Form.editors.Duration = BaseItemEditorView.extend({
            initialize: function (options) {
                if (options.schema) {
                    _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
                } else {
                    _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
                }

                this.display = {};
                this.focusedPart = 0;
                if (this.value === undefined) {
                    this.value = null;
                }

                this.currentState = 'save';
            },

            template: Handlebars.compile(template),

            focusElement: '.js-input',

            className: 'js-duration l-field l-field_duration',

            ui: {
                input: '.js-input',
                remove: '.js-duration-remove'
            },

            css: {
                focused: 'pr-focused',
                empty: 'pr-empty'
            },

            regions: {
                durationRegion: 'js-duration'
            },

            events: {
                'click @ui.remove': '__clear',
                'focus @ui.input': '__focus',
                'click @ui.input': '__focus',
                'blur @ui.input': '__blur',
                'keydown @ui.input': '__keydown'
            },

            onRender: function () {
                this.setDisplayValue(this.value);
            },

            setPermissions: function (enabled, readonly) {
                BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
                if (enabled && !readonly) {
                    this.ui.remove.show();
                } else {
                    this.ui.remove.hide();
                }
            },

            __setEnabled: function (enabled) {
                BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
                this.ui.input.prop('disabled', !enabled);
            },

            __setReadonly: function (readonly) {
                BaseItemEditorView.prototype.__setReadonly.call(this, readonly);
                if (this.getEnabled()) {
                    this.ui.input.prop('readonly', readonly);
                }
            },

            __clear: function () {
                this.currentState = 'save';
                this.applyDisplayValue(true);
            },

            __focus: function () {
                if (this.readonly) {
                    return;
                }
                if(this.currentState !== 'edit') {
                    this.currentState = 'edit';
                    this.setDisplayValue(this.value);
                }
                var pos = this.fixCaretPos(this.getCaretPos());
                this.setCaretPos(pos);
            },

            __blur: function () {
                if (this.currentState === 'save') {
                    return;
                }
                this.currentState = 'save';
                this.applyDisplayValue();
            },

            getCaretPos: function () {
                return this.ui.input.caret().start;
            },

            fixCaretPos: function (pos) {
                var resultPosition;
                var index = this.getSegmentIndex(pos);
                if (pos >= focusedParts[index].start && pos <= focusedParts[index].end) {
                    resultPosition = pos;
                } else if (pos > focusedParts[index].end && (focusedParts[index + 1] ? (pos < focusedParts[index + 1].start) : true)) {
                    resultPosition = focusedParts[index].end;
                }
                return resultPosition !== undefined ?  resultPosition : focusedParts[index].start;
            },

            setCaretPos: function (pos) {
                this.ui.input.caret(pos, pos);
            },

            getSegmentIndex: function (pos) {
                var i, segmentIndex;
                segmentIndex = 2;
                this.initSegmentStartEnd();
                for (i = 0; i < focusedParts.length; i++) {
                    if (pos >= focusedParts[i].start && pos <= focusedParts[i].end) {
                        segmentIndex = i;
                        break;
                    }
                    if (pos > focusedParts[i].end && pos < (focusedParts[i + 1] && focusedParts[i + 1].start)) {
                        if (focusedParts[i + 1] && focusedParts[i + 1].prefix && pos < (focusedParts[i + 1].start - focusedParts[i + 1].prefix.length)) {
                            segmentIndex = i;
                        } else {
                            segmentIndex = i + 1;
                        }
                        break;
                    }
                }
                return segmentIndex;
            },

            getSegmentValue: function (index) {
                var result = /(\S*)\s\S*\s(\S*)\s\S*\s(\S*)/g.exec(this.ui.input.val());
                return index !== undefined ? result[index + 1] : result.slice(1, focusedParts.length + 1);
            },

            setSegmentValue: function (index, value, replace) {
                var val = this.getSegmentValue(index);
                val = !replace ? (parseInt(val) + value) : value;
                if (val < 0) {
                    return false;
                }
                val = val.toString();
                if (val.length > focusedParts[index].maxLength) {
                    return false;
                }
                var str = this.ui.input.val();
                this.ui.input.val(str.substr(0, focusedParts[index].start) + val + str.substr(focusedParts[index].end));
                return true;
            },


            atSegmentEnd: function (position) {
                var index = this.getSegmentIndex(position);
                return (position) === focusedParts[index].end;
            },

            atSegmentStart: function (position) {
                var index = this.getSegmentIndex(position);
                return (position) === focusedParts[index].start;
            },

            __value: function (value, triggerChange) {
                triggerChange = triggerChange && value !== this.value;
                this.value = value;
                if (triggerChange) {
                    this.__triggerChange();
                }
            },

            __keydown: function (event) {
                var position = this.getCaretPos();
                var index = this.getSegmentIndex(position);
                switch (event.keyCode) {
                case keyCode.UP:
                    if (this.setSegmentValue(index, defaultOptions.step)) {
                        this.initSegmentStartEnd();
                        this.setCaretPos(focusedParts[index].end);
                    }
                    return false;
                case keyCode.DOWN:
                    if (this.setSegmentValue(index, -defaultOptions.step)) {
                        this.initSegmentStartEnd();
                        this.setCaretPos(focusedParts[index].end);
                    }
                    return false;
                case keyCode.PAGE_UP:
                    if (this.setSegmentValue(index, defaultOptions.page)) {
                        this.initSegmentStartEnd();
                        this.setCaretPos(focusedParts[index].end);
                    }
                    return false;
                case keyCode.PAGE_DOWN:
                    if (this.setSegmentValue(index, -defaultOptions.page)) {
                        this.initSegmentStartEnd();
                        this.setCaretPos(focusedParts[index].end);
                    }
                    return false;
                case keyCode.LEFT:
                    if (this.atSegmentStart(position)) {
                        if (focusedParts[index - 1]) {
                            this.setCaretPos(focusedParts[index - 1].end);
                        }
                        return false;
                    }
                    break;
                case keyCode.RIGHT:
                    if (this.atSegmentEnd(position)) {
                        if (focusedParts[index + 1]) {
                            this.setCaretPos(focusedParts[index + 1].start);
                        }
                        return false;
                    }
                    break;
                case keyCode.DELETE:
                    if (this.atSegmentStart(position)) {
                        var segmentValue = this.getSegmentValue(index);
                        if (segmentValue.length === 1) {
                            if (segmentValue !== '0') {
                                this.setSegmentValue(index, 0, true);
                                this.setCaretPos(position);
                            }    
                            return false;
                        }
                    }
                    if (this.atSegmentEnd(position)) {
                        return false;
                    }
                    break;
                case keyCode.BACKSPACE:
                    if (this.atSegmentEnd(position)) {
                        if (this.getSegmentValue(index).length === 1) {
                            this.setSegmentValue(index, 0, true);
                            this.setCaretPos(focusedParts[index].start);
                            return false;
                        }
                    }
                    if (this.atSegmentStart(position)) {
                        if (focusedParts[index - 1]) {
                            this.setCaretPos(focusedParts[index - 1].end);
                        }
                        return false;
                    }
                    break;
                case keyCode.ESCAPE:
                    this.currentState = 'save';
                    this.ui.input.blur();
                    this.refresh();
                    return false;
                case keyCode.ENTER:
                    this.__blur();
                    return false;
                case keyCode.TAB:
                    if(focusedParts[index + 1]) {
                        this.setCaretPos(focusedParts[index + 1].start);
                        return false;
                    }
                    break;
                case keyCode.HOME:
                    this.setCaretPos(focusedParts[0].start);
                    return false;
                case keyCode.END:
                    this.setCaretPos(focusedParts[focusedParts.length - 1].end);
                    return false;
                default:
                    var charValue = null;
                    if (event.keyCode >= keyCode.NUM_0 && event.keyCode <= keyCode.NUM_9) {
                        charValue = event.keyCode - keyCode.NUM_0;
                    } else if (event.keyCode >= keyCode.NUMPAD_0 && event.keyCode <= keyCode.NUMPAD_9) {
                        charValue = event.keyCode - keyCode.NUMPAD_0;
                    }
                    var valid = charValue !== null;
                    if (!valid) {
                        return false;
                    }
                    if (this.getSegmentValue(index) === '0') {
                        this.setSegmentValue(index, parseInt(charValue));
                        this.setCaretPos(focusedParts[index].end);
                        return false;
                    }
                    if (this.getSegmentValue(index).length >= focusedParts[index].maxLength) {
                        return false;
                    }
                }
            },

            initSegmentStartEnd: function () {
                var values = this.getSegmentValue();
                var start = 0;
                for (var i = 0; i < focusedParts.length; i++) {
                    focusedParts[i].separatorCode = focusedParts[i].separator && focusedParts[i].separator.charCodeAt(0);
                    start += (focusedParts[i].prefix && focusedParts[i].prefix.length) || 0;
                    focusedParts[i].start = start;
                    focusedParts[i].end = focusedParts[i].start + values[i].length;
                    start = focusedParts[i].end + focusedParts[i].text.length;
                }
            },

            applyDisplayValue: function (clear) {
                var obj;
                var val = clear ? null : this.getSegmentValue();
                if (val) {
                    obj = {
                        days: parseInt(val[0]),
                        hours: parseInt(val[1]),
                        minutes: parseInt(val[2])
                    };
                } else {
                    obj = val;
                }
                this._setCurrentDisplayValue(utils.dateHelpers.objToTimestampTakingWorkHours(obj));
                var newValue = utils.dateHelpers.durationToISOString(this._currentDisplayValue);
                if (newValue !== this.value) {
                    this.__value(newValue, true);
                }
                this.display.shortValue = this.formatValue(true);
                this.refresh();
            },

            _setCurrentDisplayValue: function (value) {
                this._currentDisplayValue = utils.dateHelpers.timestampToObjTakingWorkHours(value);
            },

            refresh: function(){
                switch(this.currentState) {
                    case 'edit':
                        this.ui.input.val(this.display.value);
                        this.$el.addClass(this.css.focused);
                        break;
                    case 'save':
                        this.ui.input.val(this.value ? this.display.shortValue : '');
                        this.$el.removeClass(this.css.focused);
                }
                if (this.value && this.value !== 'P') {
                    this.$el.removeClass(this.css.empty);
                } else {
                    this.$el.addClass(this.css.empty);
                }
            },

            _parseServerValue: function (value) {
                var durationValue = utils.dateHelpers.durationISOToObject(value);
                var totalValue = utils.dateHelpers.objToTimestampTakingWorkHours({
                    days: durationValue[0],
                    hours: durationValue[1],
                    minutes: durationValue[2]
                });
                this._setCurrentDisplayValue(totalValue);
            },

            formatValue: function (trimmed, v) {
                if (!this._currentDisplayValue && (v === null || v === undefined)) {
                    return trimmed ? '' : focusedParts[0].format(0, true) + focusedParts[1].format(0, true) + focusedParts[2].format(0, true);
                }
                v = v || 0;
                v = v / 60 / 1000;
                // replace zero w spaces
                var minutes = this._currentDisplayValue ? this._currentDisplayValue.minutes : Math.floor(v % 60);
                var hours = this._currentDisplayValue ? this._currentDisplayValue.hours : Math.floor(v / 60 % defaultOptions.workHours);
                var days = this._currentDisplayValue ? this._currentDisplayValue.days : Math.floor(v / 60 / defaultOptions.workHours);
                if (trimmed) {
                    var res = '';
                    if (days || (v !== null && !hours && !minutes)) {
                        res += days + focusedParts[0].text;
                    }
                    if (hours) {
                        res += (res ? focusedParts[1].prefix : '') + hours + focusedParts[1].text;
                    }
                    if (minutes) {
                        res += (res ? focusedParts[2].prefix : '') + minutes + focusedParts[2].text;
                    }
                    return res;
                }
                return focusedParts[0].format(days, true) + focusedParts[1].format(hours, true) + focusedParts[2].format(minutes, true);
            },

            setDisplayValue: function (value) {
                this._parseServerValue(value);
                this.display.value = this.formatValue();
                this.display.shortValue = this.formatValue(true);
                this.refresh();
            },

            setValue: function(value) {
                this.__value(value, false);
                this.setDisplayValue(value);
            }
        });

        return Backbone.Form.editors.Duration;
    });
