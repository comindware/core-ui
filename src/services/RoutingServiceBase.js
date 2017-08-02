/**
 * Developer: Stepan Burguchev
 * Date: 8/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

// storing active url to get back to it while canceling module leave
let previousUrl;
let activeUrl;
const originalCheckUrl = Backbone.history.checkUrl;
Backbone.history.checkUrl = function(e) {
    previousUrl = activeUrl;
    activeUrl = window.location.hash;
    originalCheckUrl.apply(this, arguments);
};

export default {
    initialize() {
        Backbone.history.start();
        Backbone.history.checkUrl();
    },

    canNavigateBack() {
        return previousUrl !== undefined;
    },

    navigateBack() {
        Backbone.history.history.back();
    },

    // options: replace (history), trigger (routing)
    navigateToUrl(url, options) {
        options = options || {};
        if (options.trigger === undefined) {
            options.trigger = true;
        }
        Backbone.history.navigate(url, options);
    },

    getPreviousUrl() {
        return previousUrl;
    },

    refresh() {
        Backbone.history.fragment = null;
        this.navigateToUrl(activeUrl);
    }
};
