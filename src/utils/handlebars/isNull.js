/**
 * Developer: Stepan Burguchev
 * Date: 9/1/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module */

'use strict';

import 'lib';

module.exports = function(a, options) {
    if (_.isNull(a)) {
        return options.fn(this);
    }
    return options.inverse(this);
};
