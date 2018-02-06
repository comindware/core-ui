/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { htmlHelpers } from '../index';

export default function(text, fragment) {
    if (!text) {
        return '';
    }
    if (!fragment) {
        return new Handlebars.SafeString(Handlebars.escapeExpression(text));
    }
    return new Handlebars.SafeString(htmlHelpers.highlightText(text, fragment, true));
}
