/**
 * Developer: Stepan Burguchev
 * Date: 7/1/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        './TabItemView'
    ],
    function (TabItemView) {
        'use strict';
        return Marionette.CollectionView.extend({
            initialize: function () {
            },

            className: '',

            childView: TabItemView,

            getWidths: function () {
                return _.map(this.children.toArray(), function (v) { return v.$el.outerWidth(true); });
            }
        });
    });

