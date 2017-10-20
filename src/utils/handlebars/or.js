/**
 * Developer: Stepan Burguchev
 * Date: 2/5/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

export default function(v1, v2, v3, options) {
    if (!!v1 || !!v2 || !!v3) {
        return options.fn(this);
    }
    options.inverse(this);
}
