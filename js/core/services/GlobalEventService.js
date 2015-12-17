/**
 * Developer: Stepan Burguchev
 * Date: 7/17/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'core/libApi'
], function () {
    'use strict';

    var $window = $(window);

    var GlobalEventsService = Marionette.Object.extend({
        initialize: function () {
            _.bindAll(this, '__onResize');
            
            $window.resize(this.__onResize);
        },

        onDestroy: function () {
            $window.off('resize');
        },

        __onResize: function (e) {
            this.trigger('resize', e);
        }
    });

    return new GlobalEventsService();
});
