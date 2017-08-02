/**
 * Developer: Stepan Burguchev
 * Date: 8/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

const promiseQueue = [];

export default {
    registerPromise(promise) {
        promiseQueue.push(promise);

        return promise.finally(() => {
            delete promiseQueue.splice(promiseQueue.indexOf(promise), 1);
        });
    },

    cancelAll() {
        _.each(promiseQueue, promise => {
            promise.cancel();
        });
    }
};
