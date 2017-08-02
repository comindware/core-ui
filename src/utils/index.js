/**
 * Developer: Stepan Burguchev
 * Date: 5/22/2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

import comparators_ from './comparators';
import helpers_ from './helpers';
import htmlHelpers_ from './htmlHelpers';
import dateHelpers_ from './dateHelpers';
import cookieHelpers_ from './cookieHelpers';
import keyCode_ from './keyCode';
import './handlebars/all';
import './jquery/selector.focusable';
import RegionBehavior_ from './marionette/RegionBehavior';

export const RegionBehavior = RegionBehavior_;
export const comparators = comparators_;
export const helpers = helpers_;
export const htmlHelpers = htmlHelpers_;
export const dateHelpers = dateHelpers_;
export const cookieHelpers = cookieHelpers_;
export const keyCode = keyCode_;

export default /** @lends module:core.utils */ {
    /**
     * A set of useful comparators compatible with <code>_.sortBy()</code>.<br/><br/> The following naming convention is used:
     * <code>&lt;dataType&gt;Comparator&lt;Arguments count: 1 or 2&gt;&lt;Comparing direction: 'Asc' or 'Desc'&gt;</code>.<br/><br/>
     * For example: `stringComparator2Asc` means that comparator function takes 2 string objects and compares it in ascending order.<br/><br/>
     * Can be used as <code>comparator</code> in Backbone.Collection.
     * @namespace
     * */
    comparators,
    /**
     * Useful methods used across the library.
     * @namespace
     * */
    helpers,
    /**
     * Useful methods to generate HTML and manipulate DOM-elements.
     * @namespace
     * */
    htmlHelpers,
    /**
     * Date formatters and related methods.
     * @namespace
     * */
    dateHelpers,
    /**
     * Methods to manipulate cookies data.
     * @namespace
     * */
    cookieHelpers,
    /**
     * Enumeration of key codes used in keyboard events.
     * @namespace
     * */
    keyCode,

    RegionBehavior
};
