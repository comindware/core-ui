/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        'core/list/listApi'
    ],
    function (
        list
    ) {
        'use strict';

        return Backbone.Model.extend({
            initialize: function () {
                _.extend(this, new list.models.behaviors.ListItemBehavior(this));
            },

            defaults: {
            }
        });
    });
