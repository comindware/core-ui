/**
 * Developer: Stepan Burguchev
 * Date: 8/27/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'core/libApi'
], function() {
    'use strict';

    // storing active url to get back to it while canceling module leave
    var previousUrl;
    var activeUrl;
    var originalCheckUrl = Backbone.history.checkUrl;
    Backbone.history.checkUrl = function(e) {
        previousUrl = activeUrl;
        activeUrl = window.location.hash;
        originalCheckUrl.apply(this, arguments);
    };

    return {
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
});
