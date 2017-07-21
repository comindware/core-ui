/**
 * Developer: Ksenia Kartvelishvili
 * Date: 26.12.2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars, moment } from 'lib';
import { keyCode, dateHelpers, helpers } from 'utils';
import LocalizationService from '../../services/LocalizationService';
import template from './templates/durationEditor.hbs';
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';

const focusablePartId  = {
    DAYS: 'days',
    HOURS: 'hours',
    MINUTES: 'minutes',
    SECONDS: 'seconds'
};

let createFocusableParts = function (options) {
    let result = [];
    if (options.allowDays) {
        result.push({
            id: focusablePartId.DAYS,
            text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS'),
            maxLength: 4,
            milliseconds: 1000 * 60 * 60 * options.hoursPerDay
        });
    }
    if (options.allowHours) {
        result.push({
            id: focusablePartId.HOURS,
            text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS'),
            maxLength: 4,
            milliseconds: 1000 * 60 * 60
        });
    }
    if (options.allowMinutes) {
        result.push({
            id: focusablePartId.MINUTES,
            text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES'),
            maxLength: 4,
            milliseconds: 1000 * 60
        });
    }
    if (options.allowSeconds) {
        result.push({
            id: focusablePartId.SECONDS,
            text: LocalizationService.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.SECONDS'),
            maxLength: 4,
            milliseconds: 1000
        });
    }
    return result;
};

const defaultOptions = {
    hoursPerDay: 24,
    allowDays: true,
    allowHours: true,
    allowMinutes: true,
    allowSeconds: true
};

const classes = {
    FOCUSED: 'pr-focused'
};

const stateModes = {
    EDIT: 'edit',
    VIEW: 'view'
};

/**
 * @name DurationEditorView
 * @memberof module:core.form.editors
 * @class Inline duration editor. Supported data type: <code>String</code> in ISO8601 format (for example: 'P4DT1H4M').
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number} [options.hoursPerDay=24] The amount of hours per day. The intended use case is counting work days taking work hours into account.
 * The logic is disabled by default: a day is considered as 24 hours.
 * @param {Boolean} [options.allowDays=true] Whether to display the day segment. At least one segment must be displayed.
 * @param {Boolean} [options.allowHours=true] Whether to display the hour segment. At least one segment must be displayed.
 * @param {Boolean} [options.allowMinutes=true] Whether to display the minute segment. At least one segment must be displayed.
 * @param {Boolean} [options.allowSeconds=true] Whether to display the second segment. At least one segment must be displayed.
 * */
formRepository.editors.Duration = BaseItemEditorView.extend(/** @lends module:core.form.editors.DurationEditorView.prototype */{
    initialize: function (options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.focusableParts = createFocusableParts(this.options);

        this.state = {
            mode: stateModes.VIEW,
            displayValue: dateHelpers.durationISOToObject(this.value)
        };
    },

    template: Handlebars.compile(template),

    focusElement: '.js-input',

    className: 'js-duration editor editor_duration',

    ui: {
        input: '.js-input',
        remove: '.js-duration-remove'
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
            this.ui.input.prop('tabindex', readonly ? -1 : 0);
        }
    },

    __clear: function () {
        this.__updateState({
            mode: stateModes.VIEW,
            displayValue: null
        });
        this.__value(null, true);
        this.focus();
    },

    __focus: function () {
        if (this.readonly) {
            return;
        }
        this.__updateState({
            mode: stateModes.EDIT
        });
        var pos = this.fixCaretPos(this.getCaretPos());
        this.setCaretPos(pos);
    },

    __blur: function () {
        if (this.state.mode === stateModes.VIEW) {
            return;
        }

        let values = this.getSegmentValue();
        let newValueObject = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
        this.focusableParts.forEach((seg, i) => {
            newValueObject[seg.id] = Number(values[i]);
        });

        this.__updateState({
            mode: stateModes.VIEW,
            displayValue: newValueObject
        });
        var newValue = moment.duration(this.state.displayValue).toISOString();
        this.__value(newValue, true);
    },

    getCaretPos: function () {
        return this.ui.input.getSelection().start;
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
        this.ui.input.setSelection(pos, pos);
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
        if (value === this.value) {
            return;
        }
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
            this.ui.input.blur();
            this.__updateState({
                mode: stateModes.VIEW
            });
            return false;
        case keyCode.ENTER:
            this.__blur();
            return false;
        case keyCode.TAB:
            const delta = event.shiftKey ? -1 : 1;
            if(this.focusableParts[index + delta]) {
                this.setCaretPos(this.focusableParts[index + delta].start);
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

    __createInputString: function (value, editable) {
        // The methods creates a string which reflects current mode (view/edit) and value.
        // The string is set into UI in __updateState

        let isNull = value === null;
        let seconds = !isNull ? value.seconds : 0;
        let minutes = !isNull ? value.minutes : 0;
        let hours = !isNull ? value.hours : 0;
        let days = !isNull ? value.days : 0;
        let data = {
            [focusablePartId.DAYS]: days,
            [focusablePartId.HOURS]: hours,
            [focusablePartId.MINUTES]: minutes,
            [focusablePartId.SECONDS]: seconds
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

    __normalizeDuration: function (value) {
        // Data normalization:
        // Object like this: { days: 2, hours: 3, minutes: 133, seconds: 0 }
        // Is converted into this: { days: 2, hours: 5, minutes: 13, seconds: 0 }
        // But if hours segment is disallowed, it will look like this: { days: 2, hours: 0, minutes: 313, seconds: 0 } // 313 = 133 + 3*60

        if (value === null) {
            return null;
        }
        let totalMilliseconds = moment.duration(value).asMilliseconds();
        let result = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
        this.focusableParts.forEach(seg => {
            result[seg.id] = Math.floor(totalMilliseconds / seg.milliseconds);
            totalMilliseconds = totalMilliseconds % seg.milliseconds;
        });
        return result;
    },

    setValue: function(value) {
        this.__value(value, false);
        this.__updateState({
            mode: stateModes.VIEW,
            displayValue: dateHelpers.durationISOToObject(value)
        });
    },

    __updateState: function (newState) {
        // updates inner state variables
        // updates UI

        if (!newState.mode ||
            (newState.mode === stateModes.EDIT && newState.displayValue !== undefined)) {
            helpers.throwInvalidOperationError('The operation is inconsistent or isn\'t supported by this logic.');
        }

        if (this.state.mode === newState.mode && newState.mode === stateModes.EDIT) {
            return;
        }

        this.state.mode = newState.mode;
        if (newState.displayValue !== undefined) {
            this.state.displayValue = newState.displayValue;
        }

        let normalizedDisplayValue = this.__normalizeDuration(this.state.displayValue);
        var inEditMode = this.state.mode === stateModes.EDIT;
        let val = this.__createInputString(normalizedDisplayValue, inEditMode);
        this.ui.input.val(val);
        this.$el.toggleClass(classes.FOCUSED, inEditMode);
    }
});

export default formRepository.editors.Duration;
