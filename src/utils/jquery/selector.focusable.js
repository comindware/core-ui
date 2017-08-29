/**
 * Developer: Stepan Burguchev
 * Date: 9/2/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

(function($) {
    function visible(element) {
        return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function() {
            return $.css(this, 'visibility') === 'hidden';
        }).length;
    }

    function focusable(element, isTabIndexNotNaN) {
        let map,
            mapName,
            img,
            nodeName = element.nodeName.toLowerCase();
        if (nodeName === 'area') {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
                return false;
            }
            img = $(`img[usemap=#${mapName}]`)[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName) ?
            !element.disabled :
            nodeName === 'a' ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) &&
        // the element and all of its ancestors must be visible
            visible(element);
    }

    $.extend($.expr[':'], {
        focusable(element) {
            return focusable(element, !isNaN($.attr(element, 'tabindex')));
        }
    });
}(jQuery));
