/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

export default function(a, b, options) {
    if (a !== b) {
        return options.inverse(this);
    }
    return options.fn(this);
}
