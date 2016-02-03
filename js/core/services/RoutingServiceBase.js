/**
 * Developer: Stepan Burguchev
 * Date: 8/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';

// storing active url to get back to it while canceling module leave
let previousUrl;
let activeUrl;
let originalCheckUrl = Backbone.history.checkUrl;
Backbone.history.checkUrl = function(e) {
    previousUrl = activeUrl;
    activeUrl = window.location.hash;
    originalCheckUrl.apply(this, arguments);
};

export default {
    initialize: function() {
        Backbone.history.start();
        Backbone.history.checkUrl();
    },

    canNavigateBack: function() {
        return previousUrl !== undefined;
    },

    navigateBack: function() {
        Backbone.history.history.back();
    },

    // options: replace (history), trigger (routing)
    navigateToUrl: function(url, options) {
        options = options || {};
        if (options.trigger === undefined) {
            options.trigger = true;
        }
        Backbone.history.navigate(url, options);
    },

    getPreviousUrl: function() {
        return previousUrl;
    },

    refresh: function() {
        Backbone.history.fragment = null;
        this.navigateToUrl(activeUrl);
    }
};
