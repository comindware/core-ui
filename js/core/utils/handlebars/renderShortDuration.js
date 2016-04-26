/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module */

"use strict";

import '../../libApi';
import { dateHelpers } from '../utilsApi';

module.exports = function (duration) {
    if (duration === 0) {
        return '0';
    }
    if (!duration) {
        return '';
    }
    let o = dateHelpers.durationISOToObject(duration);
    var result = '';
    if (o.days) {
        result += o.days + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS') + ' ';
    }
    if (o.hours) {
        result += o.hours + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS') + ' ';
    }
    if (o.minutes) {
        result += o.minutes + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES') + ' ';
    }
    return _.string.rtrim(result);
};
