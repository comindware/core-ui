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

define(['module/core'],
    function (core) {
        'use strict';

        return Backbone.Model.extend({
            initialize: function () {
                _.extend(this, new core.list.models.behaviors.ListItemBehavior(this));
            }
        });
    });
