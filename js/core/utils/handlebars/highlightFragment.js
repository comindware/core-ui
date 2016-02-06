/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module */

"use strict";

import { htmlHelpers } from '../utilsApi';

module.exports = function(text, fragment) {
    if (!text) {
        return '';
    }
    if (!fragment) {
        return text;
    }
    return htmlHelpers.highlightText(text, fragment, true);
};
