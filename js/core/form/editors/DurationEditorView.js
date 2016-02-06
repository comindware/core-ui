/**
 * Developer: Ksenia Kartvelishvili
 * Date: 26.12.2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import { keyCode, dateHelpers } from '../../utils/utilsApi';
import LocalizationService from '../../services/LocalizationService';
import template from './templates/durationEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';

let createFocusableParts = function () {
    let ws = ' ';
    let spaces = [
        '',
        ws,
        ws + ws,
        ws + ws + ws,
        ws + ws + ws + ws
    ];
    let focusableParts = [
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
    let format = function (v, full) {
        var val = !v ? (v === 0 ? '0' : '' ) : '' + v;
        if (val.length < this.length) {
            val = spaces[this.length - val.length] + val;
        }
        else if (val.length > this.length) {
            val = val.substring(val.length - this.length, this.length);
        }
        return (this.prefix || '') + (full ? val + this.text : val);
    };
    for (let i = 0; i < focusableParts.length; i++) {
        focusableParts[i].format = format;
    }
    return focusableParts;
};

const defaultOptions = {
    workHours: 8
};

/**
 * @name DurationEditorView
 * @memberof module:core.form.editors
 * @class Редактор для выбора значения длительности. Поддерживаемый тип данных: <code>String</code> в формате ISO8601
 * (например, 'P4DT1H4M').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Объект опций. Также поддерживаются все опции базового класса
 * {@link module:core.form.editors.base.BaseEditorView BaseEditorView}.
 * @param {Number} [options.workHours=8] Количество рабочих часов в сутках. Требуется для пересчета введенного значения.
 * */
Backbone.Form.editors.Duration = BaseItemEditorView.extend(/** @lends module:core.form.editors.DurationEditorView.prototype */{
    initialize: function (options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.focusableParts = createFocusableParts();
        this.display = {};
        this.focusedPart = 0;
        if (this.value === undefined) {
            this.value = null;
        }

        this.currentState = 'save';
    },

    template: template,

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
        var focusablePart1 = this.focusableParts[index];
        var focusablePart2 = this.focusableParts[index + 1];
        if (pos >= focusablePart1.start && pos <= focusablePart1.end) {
            resultPosition = pos;
        } else if (pos > focusablePart1.end && (focusablePart2 ? (pos < focusablePart2.start) : true)) {
            resultPosition = focusablePart1.end;
        }
        return resultPosition !== undefined ?  resultPosition : focusablePart1.start;
    },

    setCaretPos: function (pos) {
        this.ui.input.caret(pos, pos);
    },

    getSegmentIndex: function (pos) {
        var i, segmentIndex;
        segmentIndex = 2;
        this.initSegmentStartEnd();
        for (i = 0; i < this.focusableParts.length; i++) {
            var focusablePart1 = this.focusableParts[i];
            var focusablePart2 = this.focusableParts[i + 1];
            if (pos >= focusablePart1.start && pos <= focusablePart1.end) {
                segmentIndex = i;
                break;
            }
            if (pos > focusablePart1.end && pos < (focusablePart2 && focusablePart2.start)) {
                if (focusablePart2 && focusablePart2.prefix && pos < (focusablePart2.start - focusablePart2.prefix.length)) {
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
        return index !== undefined ? result[index + 1] : result.slice(1, this.focusableParts.length + 1);
    },

    setSegmentValue: function (index, value, replace) {
        var val = this.getSegmentValue(index);
        val = !replace ? (parseInt(val) + value) : value;
        if (val < 0) {
            return false;
        }
        val = val.toString();
        if (val.length > this.focusableParts[index].maxLength) {
            return false;
        }
        var str = this.ui.input.val();
        this.ui.input.val(str.substr(0, this.focusableParts[index].start) + val + str.substr(this.focusableParts[index].end));
        return true;
    },


    atSegmentEnd: function (position) {
        var index = this.getSegmentIndex(position);
        return (position) === this.focusableParts[index].end;
    },

    atSegmentStart: function (position) {
        var index = this.getSegmentIndex(position);
        return (position) === this.focusableParts[index].start;
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
        var focusablePart = this.focusableParts[index];
        switch (event.keyCode) {
        case keyCode.UP:
            if (this.setSegmentValue(index, 1)) {
                this.initSegmentStartEnd();
                this.setCaretPos(focusablePart.end);
            }
            return false;
        case keyCode.DOWN:
            if (this.setSegmentValue(index, -1)) {
                this.initSegmentStartEnd();
                this.setCaretPos(focusablePart.end);
            }
            return false;
        case keyCode.PAGE_UP:
            if (this.setSegmentValue(index, 10)) {
                this.initSegmentStartEnd();
                this.setCaretPos(focusablePart.end);
            }
            return false;
        case keyCode.PAGE_DOWN:
            if (this.setSegmentValue(index, -10)) {
                this.initSegmentStartEnd();
                this.setCaretPos(focusablePart.end);
            }
            return false;
        case keyCode.LEFT:
            if (this.atSegmentStart(position)) {
                if (this.focusableParts[index - 1]) {
                    this.setCaretPos(this.focusableParts[index - 1].end);
                }
                return false;
            }
            break;
        case keyCode.RIGHT:
            if (this.atSegmentEnd(position)) {
                if (this.focusableParts[index + 1]) {
                    this.setCaretPos(this.focusableParts[index + 1].start);
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
                    this.setCaretPos(focusablePart.start);
                    return false;
                }
            }
            if (this.atSegmentStart(position)) {
                if (this.focusableParts[index - 1]) {
                    this.setCaretPos(this.focusableParts[index - 1].end);
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
            if(this.focusableParts[index + 1]) {
                this.setCaretPos(this.focusableParts[index + 1].start);
                return false;
            }
            break;
        case keyCode.HOME:
            this.setCaretPos(this.focusableParts[0].start);
            return false;
        case keyCode.END:
            this.setCaretPos(this.focusableParts[this.focusableParts.length - 1].end);
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
                this.setCaretPos(focusablePart.end);
                return false;
            }
            if (this.getSegmentValue(index).length >= focusablePart.maxLength) {
                return false;
            }
        }
    },

    initSegmentStartEnd: function () {
        var values = this.getSegmentValue();
        var start = 0;
        for (var i = 0; i < this.focusableParts.length; i++) {
            var focusablePart = this.focusableParts[i];
            focusablePart.separatorCode = focusablePart.separator && focusablePart.separator.charCodeAt(0);
            start += (focusablePart.prefix && focusablePart.prefix.length) || 0;
            focusablePart.start = start;
            focusablePart.end = focusablePart.start + values[i].length;
            start = focusablePart.end + focusablePart.text.length;
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
        this._setCurrentDisplayValue(dateHelpers.objToTimestampTakingWorkHours(obj));
        var newValue = dateHelpers.durationToISOString(this._currentDisplayValue);
        if (newValue !== this.value) {
            this.__value(newValue, true);
        }
        this.display.shortValue = this.formatValue(true);
        this.refresh();
    },

    _setCurrentDisplayValue: function (value) {
        this._currentDisplayValue = dateHelpers.timestampToObjTakingWorkHours(value);
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
        var durationValue = dateHelpers.durationISOToObject(value);
        var totalValue = dateHelpers.objToTimestampTakingWorkHours({
            days: durationValue[0],
            hours: durationValue[1],
            minutes: durationValue[2]
        });
        this._setCurrentDisplayValue(totalValue);
    },

    formatValue: function (trimmed, v) {
        if (!this._currentDisplayValue && (v === null || v === undefined)) {
            return trimmed ? '' : this.focusableParts[0].format(0, true) + this.focusableParts[1].format(0, true) + this.focusableParts[2].format(0, true);
        }
        v = v || 0;
        v = v / 60 / 1000;
        // replace zero w spaces
        var minutes = this._currentDisplayValue ? this._currentDisplayValue.minutes : Math.floor(v % 60);
        var hours = this._currentDisplayValue ? this._currentDisplayValue.hours : Math.floor(v / 60 % this.options.workHours);
        var days = this._currentDisplayValue ? this._currentDisplayValue.days : Math.floor(v / 60 / this.options.workHours);
        if (trimmed) {
            var res = '';
            if (days || (v !== null && !hours && !minutes)) {
                res += days + this.focusableParts[0].text;
            }
            if (hours) {
                res += (res ? this.focusableParts[1].prefix : '') + hours + this.focusableParts[1].text;
            }
            if (minutes) {
                res += (res ? this.focusableParts[2].prefix : '') + minutes + this.focusableParts[2].text;
            }
            return res;
        }
        return this.focusableParts[0].format(days, true) + this.focusableParts[1].format(hours, true) + this.focusableParts[2].format(minutes, true);
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

export default Backbone.Form.editors.Duration;
