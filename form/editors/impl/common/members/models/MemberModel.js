/**
 * Developer: Ksenia Kartvelishvili
 * Date: 16.04.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        'core/list/listApi',
        'core/utils/utilsApi'
    ],
    function (
        list,
        utils
    ) {
        'use strict';

        return Backbone.Model.extend({
            initialize: function () {
                utils.helpers.applyBehavior(this, list.models.behaviors.ListItemBehavior);
            },

            matchText: function (text) {
                var name = this.get('name');
                var userName = this.get('userName');
                return (name && name.toLowerCase().indexOf(text) !== -1) ||
                       (userName && userName.toLowerCase().indexOf(text) !== -1);
            }
        });
    });
