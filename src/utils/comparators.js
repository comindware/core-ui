/**
 * Developer: Stepan Burguchev
 * Date: 9/4/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { objectPropertyTypes } from '../Meta';
import { moment } from 'lib';

export var stringComparator2Asc = function(a, b) {
    if (a) {
        if (b) {
            return a.localeCompare(b);
        }
        return -1;
    } else if (b) {
        return 1;
    }
    return 0;
};

export var stringComparator2Desc = function(a, b) {
    if (a) {
        if (b) {
            return -a.localeCompare(b);
        }
        return 1;
    } else if (b) {
        return -1;
    }
    return 0;
};

export var numberComparator2Asc = function(a, b) {
    return a - b;
};

export var numberComparator2Desc = function(a, b) {
    return b - a;
};

export var durationComparator2Asc = function(a, b) {
    if (a) {
        a = moment.duration(a);
    }
    if (b) {
        b = moment.duration(b);
    }
    return a ? (b ? a - b : 1) : (b ? -1 : 0);
};

export var durationComparator2Desc = function(a, b) {
    if (a) {
        a = moment.duration(a);
    }
    if (b) {
        b = moment.duration(b);
    }
    return b ? (a ? b - a : 1) : (a ? -1 : 0);
};

export var booleanComparator2Asc = function(a, b) {
    // true goes first
    return a ? (b ? 0 : -1) : (b ? 1 : 0);
};

export var dateComparator2Asc = function(a, b) {
    if (a) {
        a = moment(a);
    }
    if (b) {
        b = moment(b);
    }
    return a ? (b ? a - b : 1) : (b ? -1 : 0);
};

export var dateComparator2Desc = function(a, b) {
    if (a) {
        a = moment(a);
    }
    if (b) {
        b = moment(b);
    }
    return b ? (a ? b - a : 1) : (a ? -1 : 0);
};

export var booleanComparator2Desc = function(a, b) {
    return a ? (b ? 0 : 1) : (b ? -1 : 0);
};

export var referenceComparator2Asc = function(a, b) {
    const effectiveA = a ? a.name ? a.name : '' : '';
    const effectiveB = b ? b.name ? b.name : '' : '';
    return stringComparator2Asc(effectiveA, effectiveB);
};

export var referenceComparator2Desc = function(a, b) {
    const effectiveA = a ? a.name ? a.name : '' : '';
    const effectiveB = b ? b.name ? b.name : '' : '';
    return stringComparator2Desc(effectiveA, effectiveB);
};

export var getComparatorByDataType = function(dataType, sorting) {
    let comparator,
        isDesc = sorting === 'desc';
    switch (dataType) {
        case objectPropertyTypes.STRING:
            comparator = isDesc ? stringComparator2Desc : stringComparator2Asc;
            break;
        case objectPropertyTypes.DOUBLE:
        case objectPropertyTypes.INTEGER:
        case objectPropertyTypes.DECIMAL:
            comparator = isDesc ? numberComparator2Desc : numberComparator2Asc;
            break;
        case objectPropertyTypes.DURATION:
            comparator = isDesc ? durationComparator2Desc : durationComparator2Asc;
            break;
        case objectPropertyTypes.DATETIME:
            comparator = isDesc ? dateComparator2Desc : dateComparator2Asc;
            break;
        case objectPropertyTypes.BOOLEAN:
            comparator = isDesc ? booleanComparator2Desc : booleanComparator2Asc;
            break;
        case objectPropertyTypes.ACCOUNT:
        case objectPropertyTypes.INSTANCE:
        case objectPropertyTypes.DOCUMENT:
        case objectPropertyTypes.ENUM:
            comparator = isDesc ? referenceComparator2Desc : referenceComparator2Asc;
            break;
        default:
            comparator = isDesc ? stringComparator2Desc : stringComparator2Asc;
            break;
    }

    return comparator;
};

export var stringComparator1 = function(a) {
    return a;
};

export var emptyComparator = function() {
    return 0;
};

export default /** @lends module:core.utils.comparators */ {
    /**
     * @param {String} a Argument A.
     * @return {String} An object to compare with simple operators (&gt;&lt;=).
     * */
    stringComparator1,
    /**
     * @function
     * @param {String} a Argument A.
     * @param {String} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    stringComparator2Asc,
    /**
     * @function
     * @param {String} a Argument A.
     * @param {String} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    stringComparator2Desc,
    /**
     * Empty comparator.
     * @function
     * @return {Number} Always 0 (means equals).
     * */
    emptyComparator,
    /**
     * @function
     * @param {Date|String|moment} a Argument A. Javascript <code>Date</code>, date string in ISO8691 or momentJS date.
     * @param {Date|String|moment} b Argument B. Javascript <code>Date</code>, date string in ISO8691 or momentJS date.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    dateComparator2Asc,
    /**
     * @function
     * @param {Date|String|moment} a Argument A. Javascript <code>Date</code>, date string in ISO8691 or momentJS date.
     * @param {Date|String|moment} b Argument B. Javascript <code>Date</code>, date string in ISO8691 or momentJS date.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    dateComparator2Desc,
    /**
     * @function
     * @param {Number} a Argument A.
     * @param {Number} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    numberComparator2Asc,
    /**
     * @function
     * @param {Number} a Argument A.
     * @param {Number} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    numberComparator2Desc,
    /**
     * @function
     * @param {String|Object} a Argument A. An ISO8601 duration string ('P1Y2M3DT4H5M6S'), a string separated by colons like '7.23:59:59.999'
     * or MomentJS object like <code>{ seconds: 2, minutes: 2, hours: 2, days: 2, weeks: 2, months: 2, years: 2 }</code>.
     * @param {String|Object} a Argument B. An ISO8601 duration string ('P1Y2M3DT4H5M6S'), a string separated by colons like '7.23:59:59.999'
     * or MomentJS object like <code>{ seconds: 2, minutes: 2, hours: 2, days: 2, weeks: 2, months: 2, years: 2 }</code>.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    durationComparator2Asc,
    /**
     * @function
     * @param {String|Object} a Argument A. An ISO8601 duration string ('P1Y2M3DT4H5M6S'), a string separated by colons like '7.23:59:59.999'
     * or MomentJS object like <code>{ seconds: 2, minutes: 2, hours: 2, days: 2, weeks: 2, months: 2, years: 2 }</code>.
     * @param {String|Object} a Argument B. An ISO8601 duration string ('P1Y2M3DT4H5M6S'), a string separated by colons like '7.23:59:59.999'
     * or MomentJS object like <code>{ seconds: 2, minutes: 2, hours: 2, days: 2, weeks: 2, months: 2, years: 2 }</code>.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    durationComparator2Desc,
    /**
     * @function
     * @param {Boolean} a Argument A.
     * @param {Boolean} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    booleanComparator2Asc,
    /**
     * @function
     * @param {Boolean} a Argument A.
     * @param {Boolean} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    booleanComparator2Desc,
    /**
     * Method to compare objects by it's <code>name</code> property.
     * @function
     * @param {Object} a Argument A.
     * @param {Object} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    referenceComparator2Asc,
    /**
     * Method to compare objects by it's <code>name</code> property.
     * @function
     * @param {Object} a Argument A.
     * @param {Object} b Argument B.
     * @return {Number} Result as follows:
     * <ul>
     *     <li><code>-1</code> - if A &lt; B.</li>
     *     <li><code>0</code> - if A == B.</li>
     *     <li><code>1</code> - if A &gt; B.</li>
     * </ul>
     * */
    referenceComparator2Desc,
    /**
     * Method returns comparator function based on type name.
     * @function
     * @param {String} dataType Data type as in <code>core.meta.objectPropertyTypes</code>.
     * @param {String} sorting What sorting do we need? Options: <ul><li><code>'asc'</code></li><li><code>'desc'</code></li></ul>
     * @return {Function} Comparator function.
     * */
    getComparatorByDataType
};
