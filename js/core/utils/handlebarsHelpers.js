/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import moment from '../libApi';
import dateHelpers from './dateHelpers';
import htmlHelpers from './htmlHelpers';

Handlebars.registerHelper("debug", function(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);

    if (optionalValue) {
        console.log("Value");
        console.log("====================");
        console.log(optionalValue);
    }
});

Handlebars.registerHelper("equal", function(a, b, options){
    if( a !== b ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

Handlebars.registerHelper("localize", function(textId) {
    return Localizer.get(textId);
});

Handlebars.registerHelper("localizedText", function(textModel) {
    return Localizer.resolveLocalizedText(textModel);
});

Handlebars.registerHelper("highlightFragment", function(text, fragment) {
    if (!text) {
        return '';
    }
    if (!fragment) {
        return text;
    }
    return htmlHelpers.highlightText(text, fragment, true);
});

Handlebars.registerHelper("renderFullDate", function(date) {
    return moment(date).format('ll');
});

Handlebars.registerHelper("renderFullDateTime", function(date) {
    return moment(date).format('LLL');
});

Handlebars.registerHelper('renderShortDuration', function (duration) {
    if (duration === 0) {
        return '0';
    }
    if (!duration) {
        return '';
    }
    var durationValue = dateHelpers.durationISOToObject(duration);
    var totalValue = dateHelpers.objToTimestampTakingWorkHours({
        days: durationValue[0],
        hours: durationValue[1],
        minutes: durationValue[2]
    });
    var o = dateHelpers.timestampToObjTakingWorkHours(totalValue);
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
});

Handlebars.registerHelper("renderAsHtml", function(text) {
    if (!text) {
        return '';
    }
    var lines = text.split(/[\r\n]+/g);
    var result = [];
    _.each(lines, function (line) {
        result.push(Handlebars.Utils.escapeExpression(line));
    });
    return result.join('<br>');
});
