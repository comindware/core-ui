/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, _, Handlebars */

/*
* HtmlHelpers contains methods that somehow modify dom elements or generate html.
*
* */
define(['module/lib'],
    function () {
        'use strict';

        var htmlHelpers = {
            /*
            * Highlights fragments within a text with <span class='highlight'><span>.
            *
            * If escape is true (or not provided), escapes the text with Handlebars.Utils.escapeExpression first.
            *
            * */
            highlightText: function (text, fragment, escape)
            {
                if (escape || escape === undefined) {
                    text = Handlebars.Utils.escapeExpression(text);
                }

                var lowerText = text.toLowerCase();
                var startIndex = 0;
                var index;
                var output = '';
                while ((index = lowerText.indexOf(fragment, startIndex)) !== -1) {
                    var index2 = index + fragment.length;
                    output += text.substring(startIndex, index) + "<span class='highlight'>" + text.substring(index, index2) + '</span>';
                    startIndex = index2;
                }

                if (startIndex < text.length) {
                    output += text.substring(startIndex);
                }

                return output;
            },

            isElementInDom: function (el) {
                return document.body.contains(el);
            },

            /*
            * Assigns empty onselectstart and ondragstart events handlers to prevent selection on an element.
            *
            * */
            forbidSelection: function (el)
            {
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

            getDocumentPosition: function (el) {
                if (el instanceof window.jQuery) {
                    el = el[0];
                }

                var left = 0;
                var top = 0;
                do {
                    if (!isNaN(el.offsetLeft)) {
                        left += el.offsetLeft;
                    }
                    if (!isNaN(el.offsetTop)) {
                        top += el.offsetTop;
                    }
                    el = el.offsetParent;
                } while (el);
                return { x:left, y:top };
            }
        };

        return htmlHelpers;
    });
