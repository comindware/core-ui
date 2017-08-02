/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import UserService from 'services/UserService';

export default /** @lends module:core.utils.htmlHelpers */ {
    /**
     * Highlights fragments within a text with &lt;span class='highlight'&gt;&lt;/span&gt;.
     * @param {String} text Text to highlight.
     * @param {String} fragment highlighted fragment.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightText(text, fragment, escape) {
        if (!text) {
            return '';
        }
        if (escape || escape === undefined) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const lowerText = text.toLowerCase();
        let startIndex = 0;
        let index;
        let output = '';
        while ((index = lowerText.indexOf(fragment, startIndex)) !== -1) {
            const index2 = index + fragment.length;
            output += `${text.substring(startIndex, index)}<span class='highlight'>${text.substring(index, index2)}</span>`;
            startIndex = index2;
        }

        if (startIndex < text.length) {
            output += text.substring(startIndex);
        }

        return output;
    },

    /**
     * Highlights mentions within a text with &lt;a href='...'&gt;&lt;/a&gt;.
     * @param {String} text Text to highlight.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightMentions(text, escape) {
        if (!text) {
            return '';
        }
        if (escape || escape === undefined) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const membersByUserName = _.reduce(UserService.listUsers(), (memo, user) => {
            if (user.userName) {
                memo[user.userName] = user;
            }
            return memo;
        }, {});
        const regex = /(\s|^)@([a-z0-9_\.]+)/gi;

        return text.replace(regex, (fragment, whitespace, userName) => {
            const user = membersByUserName[userName];
            if (user) {
                return `${whitespace}<a href="${user.url}" title="${user.name}">@${user.userName}</a>`;
            }
            return fragment;
        });
    },

    /**
     * Highlights urls within a text with &lt;a href='...'&gt;&lt;/a&gt;.
     * @param {String} text Text to highlight.
     * @param {Boolean} [escape=true] If true, <code>Handlebars.Utils.escapeExpression</code> will be applied on to
     * the <code>text</code> before highlighting.
     * @return {String} Highlighted text
     * */
    highlightUrls(text, escape) {
        if (!text) {
            return '';
        }
        if (escape || escape === undefined) {
            text = Handlebars.Utils.escapeExpression(text);
        }

        const regex = /(?:ht|f)tp(?:s?):\/\/[^\s]*/gi;
        return text.replace(regex, url => `<a href="${url}">${url}</a>`);
    },

    /**
     * Checks if element is presented in visible DOM.
     * @param {Object} el DOM-element to check.
     * @return {Boolean} True if an element is presented in DOM.
     * */
    isElementInDom(el) {
        return document.body.contains(el);
    },

    /**
     * Use CSS for the same effect. IE8 is not supported anymore.
     * @deprecated
     */
    forbidSelection(el) {
        function stopAndPreventDefault(e) {
            if (e === undefined) {
                return false;
            }

            e.preventDefault();
            e.stopPropagation();
        }

        el.onselectstart = stopAndPreventDefault;
        el.ondragstart = stopAndPreventDefault;
    },

    /**
     * Use jQuery <code>.offset()</code>.
     * @deprecated
     */
    getDocumentPosition(el) {
        if (el instanceof window.jQuery) {
            el = el[0];
        }

        let left = 0;
        let top = 0;
        do {
            if (!isNaN(el.offsetLeft)) {
                left += el.offsetLeft;
            }
            if (!isNaN(el.offsetTop)) {
                top += el.offsetTop;
            }
            el = el.offsetParent;
        } while (el);
        return { x: left, y: top };
    }
};
