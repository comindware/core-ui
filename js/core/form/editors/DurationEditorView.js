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

const focusablePartId  = {
    DAYS: 'days',
    HOURS: 'hours',
    MINUTES: 'minutes'
};

let createFocusableParts = function (options) {
    let result = [];
    if (options.allowDays) {
        result.push({
            id: focusablePartId.DAYS,
            text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS'),
            maxLength: 4
        });
    }
    if (options.allowHours) {
        result.push({
            id: focusablePartId.HOURS,
            text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS'),
            maxLength: 4
        });
    }
    if (options.allowMinutes) {
        result.push({
            id: focusablePartId.MINUTES,
            text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES'),
            maxLength: 4
        });
    }
    return result;
};

const defaultOptions = {
    workHours: 24,
    allowDays: true,
    allowHours: true,
    allowMinutes: true
};

/**
 * @name DurationEditorView
 * @memberof module:core.form.editors
 * @class Inline duration editor. Supported data type: <code>String</code> in ISO8601 format (for example: 'P4DT1H4M').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number} [options.workHours=24] The amount of work hours a day.
 * The edited value is converted into the actual value of days and hours according to this constant.
 * The logic is disabled by default: a day is considered as 24 hours.
 * */
Backbone.Form.editors.Duration = BaseItemEditorView.extend(/** @lends module:core.form.editors.DurationEditorView.prototype */{
    initialize: function (options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.focusableParts = createFocusableParts(this.options);
        this.display = {};
        if (this.value === undefined) {
            this.value = null;
        }

        /*this.state = new Backbone.Model({
            mode: 'save'
        });*/

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
        // returns the index of the segment where we are at
        var i, segmentIndex;
        segmentIndex = this.focusableParts.length - 1;
        this.initSegmentStartEnd();
        for (i = 0; i < this.focusableParts.length; i++) {
            var focusablePart1 = this.focusableParts[i];
            var focusablePart2 = this.focusableParts[i + 1];
            if (focusablePart1.start <= pos && pos <= focusablePart1.end) {
                // the position is within the first segment
                segmentIndex = i;
                break;
            }
            if (focusablePart2) {
                if (focusablePart1.end < pos && pos < focusablePart2.start) {
                    const whitespaceLength = 1;
                    if (pos < (focusablePart2.start - whitespaceLength)) {
                        // the position is at '1 <here>d 2 h' >> first fragment
                        segmentIndex = i;
                    } else {
                        // the position is at '1 d<here> 2 h' >> second fragment
                        segmentIndex = i + 1;
                    }
                    break;
                }
            }
        }
        return segmentIndex;
    },

    getSegmentValue: function (index) {
        let segments = [];
        for (let i = 0; i < this.focusableParts.length; i++) {
            // matches '123 d' segment
            segments.push('(\\S*)\\s+\\S*');
        }
        let regexStr = `^\\s*${segments.join('\\s+')}$`;
        let result = new RegExp(regexStr, 'g').exec(this.ui.input.val());
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
            if (i > 0) {
                // counting whitespace before the value of the segment
                start++;
            }
            focusablePart.start = start;
            focusablePart.end = focusablePart.start + values[i].length;
            start = focusablePart.end + focusablePart.text.length;
        }
    },

    applyDisplayValue: function (clear) {
        let obj;
        if (clear) {
            obj = null;
        } else {
            let values = this.getSegmentValue();
            obj = {
                days: 0,
                hours: 0,
                minutes: 0
            };
            this.focusableParts.forEach((seg, i) => {
                obj[seg.id] = Number(values[i]);
            });
        }

        this._setCurrentDisplayValue(this.__objectToTimestampTakingWorkHours(obj));
        var newValue = dateHelpers.durationToISOString(this._currentDisplayValue);
        if (newValue !== this.value) {
            this.__value(newValue, true);
        }
        this.display.shortValue = this.__createInputString(false);
        this.refresh();
    },

    _setCurrentDisplayValue: function (value) {
        this._currentDisplayValue = this.__timestampToObjectTakingWorkHours(value);
    },

    refresh: function () {
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

    __createInputString: function (editable) {
        let isNull = this._currentDisplayValue === null;
        let minutes = !isNull ? this._currentDisplayValue.minutes : 0;
        let hours = !isNull ? this._currentDisplayValue.hours : 0;
        let days = !isNull ? this._currentDisplayValue.days : 0;
        let data = {
            [focusablePartId.DAYS]: days,
            [focusablePartId.HOURS]: hours,
            [focusablePartId.MINUTES]: minutes
        };

        if (!editable) {
            if (isNull) {
                // null value is rendered as empty text
                return '';
            }
            let filledSegments = this.focusableParts.filter(x => Boolean(data[x.id]));
            if (filledSegments.length > 0) {
                // returns string like '0d 4h 32m'
                return filledSegments.reduce((p, seg) => p + `${data[seg.id]}${seg.text} `, '').trim();
            } else {
                // returns string like '0d'
                return `0${this.focusableParts[0].text}`;
            }
        } else {
            // always returns string with all editable segments like '0 d 5 h 2 m'
            return this.focusableParts.map(seg => {
                let val = data[seg.id];
                let valStr = _.isNumber(val) ? String(val) : '';
                return valStr + seg.text;
            }).join(' ');
        }
    },

    setDisplayValue: function (value) {
        this._parseServerValue(value);
        this.display.value = this.__createInputString(true);
        this.display.shortValue = this.__createInputString(false);
        this.refresh();
    },

    _parseServerValue: function (value) {
        var durationValue = dateHelpers.durationISOToObject(value);
        var totalValue = this.__objectToTimestampTakingWorkHours({
            days: durationValue[0],
            hours: durationValue[1],
            minutes: durationValue[2]
        });
        this._setCurrentDisplayValue(totalValue);
    },

    setValue: function(value) {
        this.__value(value, false);
        this.setDisplayValue(value);
    },

    __timestampToObjectTakingWorkHours: function (value) {
        if (value === null) {
            return value;
        }
        var v = value || 0;
        v = v / 60 / 1000;
        return {
            days: Math.floor(v / 60 / this.options.workHours),
            hours: Math.floor((v / 60) % this.options.workHours),
            minutes: Math.floor(v % 60)
        };
    },

    __objectToTimestampTakingWorkHours: function (object) {
        return object ? (object.days * 60 * this.options.workHours + object.hours * 60 + object.minutes) * 60 * 1000 : object === 0 ? 0 : null;
    }
});

export default Backbone.Form.editors.Duration;
