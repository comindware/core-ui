/**
 * Developer: Stepan Burguchev
 * Date: 2/5/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

export default function(optionalValue) {
    console.log('Current Context');
    console.log('====================');
    console.log(this);
    if (optionalValue) {
        console.log('Value');
        console.log('====================');
        console.log(optionalValue);
    }
}
