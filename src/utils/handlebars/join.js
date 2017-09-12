/**
 * Developer: Stepan Burguchev
 * Date: 2/5/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

export default function(context, separator, options) {
    let ret = '';

    for (let i = 0, j = context.length; i < j; i++) {
        ret = ret + (i === 0 ? '' : separator) + options.fn(context[i]);
    }

    return ret;
}
