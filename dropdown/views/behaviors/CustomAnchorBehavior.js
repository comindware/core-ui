/**
 * Developer: Stepan Burguchev
 * Date: 12/1/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([ 'module/utils' ],
    function () {
        'use strict';

        var classes = {
            ANCHOR: 'dropdown__anchor'
        };

        return Marionette.Behavior.extend({
            initialize: function (options, view) {
            },

            onRender: function () {
                var $el;
                if (this.options.anchor) {
                    $el = this.$(this.options.anchor);
                } else {
                    $el = this.$el;
                }
                $el.addClass(classes.ANCHOR);
            }
        });
    });
