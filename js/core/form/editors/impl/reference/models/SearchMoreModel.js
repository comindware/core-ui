/**
 * Developer: Stepan Burguchev
 * Date: 12/3/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
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
