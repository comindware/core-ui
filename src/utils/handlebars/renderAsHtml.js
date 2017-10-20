/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';

export default function(text) {
    if (!text) {
        return '';
    }
    const lines = text.split(/[\r\n]+/g);
    const result = [];
    _.each(lines, line => {
        result.push(Handlebars.Utils.escapeExpression(line));
    });
    return result.join('<br>');
}
