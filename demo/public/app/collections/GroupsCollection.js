/**
 * Developer: Alexander Makarov
 * Date: 08.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _, Localizer */

define(['comindware/core', '../models/GroupModel'],
    function (core, GroupModel) {
        'use strict';

        return Backbone.Collection.extend({
            initialize: function () {
                _.extend(this, new core.models.behaviors.SelectableBehavior.SingleSelect(this));
            },

            model: GroupModel
        });
    });
