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

define([],
    function () {
        'use strict';

        return {
            stringComparator1: function (a) {
                return a;
            },
            stringComparator2Asc: function (a, b) {
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
            },
            stringComparator2Desc: function (a, b) {
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
            },
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
            numberComparator2Asc: function (a, b)
            {
                return a - b;
            },
            numberComparator2Desc: function (a, b)
            {
                return b - a;
            },
            durationComparator2Asc: function (a, b)
            {
                // TODO: fix me!
                return a - b;
            },
            durationComparator2Desc: function (a, b)
            {
                // TODO: fix me!
                return b - a;
            },
            booleanComparator2Asc: function (a, b)
            {
                // true goes first
                return a ? (b ? 0 : -1) : (b ? 1 : 0);
            },
            booleanComparator2Desc: function (a, b)
            {
                return a ? (b ? 0 : 1) : (b ? -1 : 0);
            }
        };
    });
