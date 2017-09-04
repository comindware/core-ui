/**
 * Developer: Stepan Burguchev
 * Date: 8/17/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'comindware/core',
    'text!../templates/listCanvas.html'
], (core, template) => {
    'use strict';

    return Marionette.LayoutView.extend({
        initialize() {
        },

        template: Handlebars.compile(template),

        regions: {
            contentRegion: '.js-content-region',
            scrollbarRegion: '.js-scrollbar-region'
        },

        className: 'demo-list-canvas__view',

        onShow() {
            this.contentRegion.show(this.options.content);
            this.scrollbarRegion.show(this.options.scrollbar);
        }
    });
});
