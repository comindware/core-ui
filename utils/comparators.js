/**
 * Developer: Stepan Burguchev
 * Date: 9/4/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require */

/*
* A set of useful comparators (that can be used in Backbone collections or _.sortBy) in the following naming convention:
*
* <dataType>Comparator<Arguments count: 1,2><Comparing direction: Asc, Desc>
*
* For example `stringComparator2Asc` means comparator function that takes 2 string objects and compares it in ascending order.
*
* */

define(['core/meta'],
    function (meta) {
        'use strict';

        var stringComparator2Asc = function (a, b) {
            if (a) {
                if (b) {
                    return a.localeCompare(b);
                } else {
                    return -1;
                }
            } else if (b) {
                return 1;
            }
            return 0;
        };

        var stringComparator2Desc = function (a, b) {
            if (a) {
                if (b) {
                    return -a.localeCompare(b);
                } else {
                    return 1;
                }
            } else if (b) {
                return -1;
            }
            return 0;
        };

        var numberComparator2Asc = function (a, b) {
            return a - b;
        };

        var numberComparator2Desc = function (a, b) {
            return b - a;
        };

        var durationComparator2Asc = function (a, b) {
            // TODO: fix me!
            return a - b;
        };

        var durationComparator2Desc = function (a, b) {
            // TODO: fix me!
            return b - a;
        };

        var booleanComparator2Asc = function (a, b) {
            // true goes first
            return a ? (b ? 0 : -1) : (b ? 1 : 0);
        };

        var dateComparator2Asc = function (a, b) {
            return a - b;
        };

        var dateComparator2Desc = function (a, b) {
            return b - a;
        };

        var booleanComparator2Desc = function (a, b) {
            return a ? (b ? 0 : 1) : (b ? -1 : 0);
        };

        var referenceComparator2Asc = function(a, b) {
            var effectiveA = a ? a.name ? a.name : "" : "";
            var effectiveB = b ? b.name ? b.name : "" : "";
            return stringComparator2Asc(effectiveA, effectiveB);
        };

        var referenceComparator2Desc = function(a, b) {
            var effectiveA = a ? a.name ? a.name : "" : "";
            var effectiveB = b ? b.name ? b.name : "" : "";
            return stringComparator2Desc(effectiveA, effectiveB);
        };

        var getComparatorByDataType = function (dataType, sorting) {
            var comparator,
                isDesc = sorting === 'desc';
            switch (dataType) {
            case meta.objectPropertyTypes.STRING:
                comparator = isDesc ? stringComparator2Desc : stringComparator2Asc;
                break;
            case meta.objectPropertyTypes.DOUBLE:
            case meta.objectPropertyTypes.INTEGER:
            case meta.objectPropertyTypes.DECIMAL:
                comparator = isDesc ? numberComparator2Desc : numberComparator2Asc;
                break;
            case meta.objectPropertyTypes.DURATION:
                comparator = isDesc ? durationComparator2Desc : durationComparator2Asc;
                break;
            case meta.objectPropertyTypes.DATETIME:
                comparator = isDesc ? dateComparator2Desc : dateComparator2Asc;
                break;
            case meta.objectPropertyTypes.BOOLEAN:
                comparator = isDesc ? booleanComparator2Desc : booleanComparator2Asc;
                break;
            case meta.objectPropertyTypes.ACCOUNT:
            case meta.objectPropertyTypes.INSTANCE:
            case meta.objectPropertyTypes.DOCUMENT:
            case meta.objectPropertyTypes.ENUM:
                comparator = isDesc ? referenceComparator2Desc : referenceComparator2Asc;
                break;
            default:
                comparator = isDesc ? stringComparator2Desc : stringComparator2Asc;
                break;
            }

            return comparator;
        };

        return {
            stringComparator1: function (a) {
                return a;
            },
            stringComparator2Asc: stringComparator2Asc,
            stringComparator2Desc: stringComparator2Desc,
            emptyComparator: function () {
                return 0;
            },
            dateComparator2Asc: function (a, b)
            {
                return a - b;
            },
            dateComparator2Desc: function (a, b)
            {
                return b - a;
            },
            numberComparator2Asc: numberComparator2Asc,
            numberComparator2Desc: numberComparator2Desc,
            durationComparator2Asc: durationComparator2Asc,
            durationComparator2Desc: durationComparator2Desc,
            booleanComparator2Asc: booleanComparator2Asc,
            booleanComparator2Desc: booleanComparator2Desc,
            referenceComparator2Asc: referenceComparator2Asc,
            referenceComparator2Desc: referenceComparator2Desc,
            getComparatorByDataType: getComparatorByDataType
        };
    });
