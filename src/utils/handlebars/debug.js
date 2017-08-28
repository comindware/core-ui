/**
 * Developer: Stepan Burguchev
 * Date: 2/5/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global module */

'use strict';

module.exports = function(optionalValue) {
    console.log('Current Context');
    console.log('====================');
    console.log(this);
    if (optionalValue) {
        console.log('Value');
        console.log('====================');
        console.log(optionalValue);
    }
};
