/**
 * Developer: Stepan Burguchev
 * Date: 7/23/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'text!../templates/demoContent.html',
    'module/shared'
], function (template, shared) {
    'use strict';
    return Marionette.LayoutView.extend({
        template: Handlebars.compile(template),

        className: 'content-view',

        behaviors: {
            ContentViewBehavior: {
                behaviorClass: shared.application.views.behaviors.ContentViewBehavior,
                profileRegion: 'profileRegion',
                moduleLoadingRegion: 'moduleLoadingRegion'
            }
        },

        ui: {
            navigationButton: '.js-navigation-button'
        },

        regions: {
            profileRegion: '.js-profile-region',
            moduleLoadingRegion: '.js-module-loading-region',
            moduleRegion: '.js-module-region'
        },

        setNavigationVisibility: function (visible) {
            if (visible) {
                this.ui.navigationButton.show();
            } else {
                this.ui.navigationButton.hide();
            }
        }
    });
});
