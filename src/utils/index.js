import comparators_ from './comparators';
import helpers_ from './helpers';
import htmlHelpers_ from './htmlHelpers';
import dateHelpers_ from './dateHelpers';
import diffHelper_ from './diffHelper';
import keyCode_ from './keyCode';
import './handlebars/all';
import './codemirror';
import transliterator_ from './transliterator';
import stickybits_ from 'stickybits';

export const comparators = comparators_;
export const helpers = helpers_;
export const htmlHelpers = htmlHelpers_;
export const dateHelpers = dateHelpers_;
export const keyCode = keyCode_;
export const diffHelper = diffHelper_;
export const stickybits = stickybits_;
export const transliterator = transliterator_;

export default {
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
     * Enumeration of key codes used in keyboard events.
     * @namespace
     * */
    keyCode,
    transliterator,

    diffHelper,

    stickybits
};
