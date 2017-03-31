/**
 * Developer: Stepan Burguchev
 * Date: 8/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import 'lib';

let promiseQueue = [];

export default {
    registerPromise: function(promise) {
        promiseQueue.push(promise);

        return promise.finally(function() {
            delete promiseQueue.splice(promiseQueue.indexOf(promise), 1);
        });
    },

    cancelAll: function() {
        _.each(promiseQueue, function(promise) {
            promise.cancel();
        });
    }
};
