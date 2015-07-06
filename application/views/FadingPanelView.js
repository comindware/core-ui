/**
 * Developer: Stepan Burguchev
 * Date: 9/16/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, Handlebars */

define(['text!../templates/fadingPanel.html', 'module/lib'],
    function (template) {
        'use strict';

        return Marionette.ItemView.extend({
            initialize: function () {
            },

            template: Handlebars.compile(template),

            className: 'fadingPanel',

            events: {
                'click': '__onClick'
            },

            fadeIn: function (options)
            {
                this.activeOptions = options || null;
                this.$el.fadeTo(400, 0.3);
            },

            fadeOut: function ()
            {
                this.activeOptions = null;
                this.$el.fadeOut(400, 0);
            },

            __onClick: function () {
                if (!this.activeOptions || this.activeOptions.fadeOut !== false) {
                    this.fadeOut();
                }
            }
        });
    });
